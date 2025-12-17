import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";
import { createNodeWebSocket } from "@hono/node-ws";
import type { WSContext } from "hono/ws";
import type WebSocket from "ws";
import { iife, writableIterator } from "./utils";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { OpenAITTSClient, OPENAI_TTS_SAMPLE_RATE } from "./openai/index";
import { AssemblyAISTT } from "./assemblyai/index";
import { vadStream } from "./vad";
import type { VoiceAgentEvent } from "./types";

let prisma: any = null;
async function getPrisma() {
    if (!prisma) {
        const db = await import("../lib/db");
        prisma = db.prisma;
    }
    return prisma;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STATIC_DIR = path.join(__dirname, "../web/dist");
const PORT = parseInt(process.env.PORT ?? "8000");

const app = new Hono();
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
];

app.use("/*", cors({
    origin: (origin) => {
        if (!origin) return origin;
        const isAllowed = ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed));
        return isAllowed ? origin : undefined;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
}));

const systemPrompt = `
<role>
You are a professional behavioral interviewer conducting a realistic mock interview. You have extensive experience in technical and behavioral interviews for top companies.
</role>

<persona>
- Professional, warm, and encouraging tone
- Speak naturally as a real interviewer would
- Keep responses concise (1-3 sentences for questions, brief acknowledgments)
- Never lecture or give long monologues
</persona>

<interview_rules>
<during_interview>
- Ask ONE question at a time, then wait for response
- Ask natural follow-up questions when answers are vague or interesting
- Follow-ups must be based on what candidate just said
- Do NOT give feedback or coaching during the interview
- Do NOT evaluate out loud
- Maximum 2 follow-ups per core question
</during_interview>

<question_types>
- "Tell me about a time when..."
- "Describe a situation where..."
- "Give me an example of..."
- "Walk me through how you..."
</question_types>

<follow_up_examples>
- "Can you walk me through your decision there?"
- "What was your specific role in that?"
- "What happened as a result?"
- "What would you do differently?"
</follow_up_examples>
</interview_rules>

<interview_structure>
1. Brief introduction (already done in greeting)
2. Ask 5-7 core behavioral questions based on resume and job description
3. 0-2 follow-ups per question depending on answer quality
4. Close the interview politely when complete
</interview_structure>

<evaluation_criteria>
Use STAR method to evaluate answers:
- Situation: Was context clear?
- Task: Was their responsibility clear?
- Action: Were specific actions detailed?
- Result: Was impact/outcome stated?
</evaluation_criteria>

<question_logging>
IMPORTANT: After the candidate answers each MAIN behavioral question (not follow-ups), use the save_question tool to log:
- The main question you asked
- The candidate's complete answer (including any follow-up responses)

This creates a record for detailed feedback later.
</question_logging>

<feedback_tool>
When the interview ends (user says goodbye or ends session), use the save_feedback tool to record:
- Score (0-100 based on overall performance)
- Strengths (3-5 specific positive observations)
- Weaknesses (3-5 areas for improvement)
- Priorities (3-5 focus areas for next practice)
- questionFeedback (optional array with per-question analysis)
</feedback_tool>

<constraints>
- Never invent experiences the candidate didn't mention
- Never coach during the interview (only after)
- Never skip follow-ups if clarification is needed
- Never expose internal reasoning or evaluation
</constraints>

<speech_guidelines>
- Keep responses SHORT and conversational
- Speak naturally, not robotically
- Avoid filler words and unnecessary explanations
- One thought per response
</speech_guidelines>
`;

const saveQuestionTool = tool(
    async ({ sessionId, question, answer }) => {
        try {
            const db = await getPrisma();

            await db.question.create({
                data: {
                    sessionId: sessionId,
                    content: question,
                    answer: answer,
                    feedback: null,
                    score: null
                }
            });
            return "Question logged successfully.";
        } catch (e: any) {
            return `Error logging question: ${e.message}`;
        }
    },
    {
        name: "save_question",
        description: "Log a question and the candidate's answer during the interview for later analysis.",
        schema: z.object({
            sessionId: z.string().describe("The UUID of the current session"),
            question: z.string().describe("The behavioral question you asked"),
            answer: z.string().describe("The candidate's answer to the question")
        })
    }
);

const saveFeedbackTool = tool(
    async ({ sessionId, score, strengths, weaknesses, priorities, questionFeedback }) => {
        try {
            const db = await getPrisma();

            const feedbackData = {
                strengths,
                weaknesses,
                priorities
            };

            await db.interviewSession.update({
                where: { id: sessionId },
                data: {
                    score: score,
                    feedbackSummary: feedbackData,
                    duration: 300
                }
            });

            if (questionFeedback && questionFeedback.length > 0) {
                const questions = await db.question.findMany({
                    where: { sessionId },
                    orderBy: { createdAt: 'asc' }
                });

                for (let i = 0; i < Math.min(questions.length, questionFeedback.length); i++) {
                    await db.question.update({
                        where: { id: questions[i].id },
                        data: {
                            feedback: questionFeedback[i].feedback,
                            score: questionFeedback[i].score
                        }
                    });
                }
            }

            return "Feedback saved successfully.";
        } catch (e: any) {
            return `Error saving feedback: ${e.message}`;
        }
    },
    {
        name: "save_feedback",
        description: "Save final interview feedback, score, and analysis to the database.",
        schema: z.object({
            sessionId: z.string().describe("The UUID of the current session"),
            score: z.number().min(0).max(100).describe("Role fit score from 0-100"),
            strengths: z.array(z.string()).describe("List of candidate strengths"),
            weaknesses: z.array(z.string()).describe("List of areas for improvement"),
            priorities: z.array(z.string()).describe("List of priority focus areas"),
            questionFeedback: z.array(z.object({
                feedback: z.array(z.string()).describe("List of feedback points for this specific question"),
                score: z.number().min(0).max(100).describe("Score for this specific question")
            })).optional().describe("Optional per-question feedback array, in order asked")
        })
    }
);

const agent = createReactAgent({
    llm: new ChatOpenAI({ model: "gpt-4o", temperature: 0.7 }),
    tools: [saveQuestionTool, saveFeedbackTool],
    checkpointSaver: new MemorySaver(),
    messageModifier: systemPrompt,
});

/**
 * Transform stream: Audio (Uint8Array) → Voice Events (VoiceAgentEvent)
 */
async function* sttStream(
    audioStream: AsyncIterable<Uint8Array>
): AsyncGenerator<VoiceAgentEvent> {
    const stt = new AssemblyAISTT({ sampleRate: 16000 });
    const passthrough = writableIterator<VoiceAgentEvent>();

    let audioChunkCount = 0;
    const producer = iife(async () => {
        try {
            for await (const audioChunk of audioStream) {
                audioChunkCount++;
                if (audioChunkCount % 50 === 1) {
                }
                await stt.sendAudio(audioChunk);
            }
        } finally {
            await stt.close();
        }
    });

    const consumer = iife(async () => {
        for await (const event of stt.receiveEvents()) {
            passthrough.push(event);
        }
    });

    try {
        yield* passthrough;
    } finally {
        await Promise.all([producer, consumer]);
    }
}

/**
 * Transform stream: Voice Events → Voice Events (with Agent Responses)
 */
async function* agentStream(
    eventStream: AsyncIterable<VoiceAgentEvent>
): AsyncGenerator<VoiceAgentEvent> {
    const threadId = uuidv4();

    for await (const event of eventStream) {
        const isSystemContext = event.type === "stt_output" &&
            event.transcript.startsWith("SYSTEM CONTEXT");

        if (!isSystemContext) {
            yield event;
        }

        if (event.type === "stt_output") {
            const stream = await agent.stream(
                { messages: [new HumanMessage(event.transcript)] },
                {
                    configurable: { thread_id: threadId },
                    streamMode: "messages",
                }
            );

            if (isSystemContext) {
                for await (const _ of stream) {
                }
                continue;
            }

            for await (const [message] of stream) {
                if (AIMessage.isInstance(message)) {
                    const hasToolCalls = message.tool_calls && message.tool_calls.length > 0;

                    if (message.content && typeof message.content === 'string') {
                        yield { type: "agent_chunk", text: message.content, ts: Date.now() };
                    }

                    if (hasToolCalls) {
                        for (const toolCall of message.tool_calls!) {
                            yield {
                                type: "tool_call",
                                id: toolCall.id ?? uuidv4(),
                                name: toolCall.name,
                                args: toolCall.args,
                                ts: Date.now(),
                            };
                        }
                    }
                }

                if (ToolMessage.isInstance(message)) {
                    yield {
                        type: "tool_result",
                        toolCallId: message.tool_call_id ?? "",
                        name: message.name ?? "unknown",
                        result:
                            typeof message.content === "string"
                                ? message.content
                                : JSON.stringify(message.content),
                        ts: Date.now(),
                    };
                }
            }

            yield { type: "agent_end", ts: Date.now() };
        }
    }
}

/**
 * Transform stream: Voice Events → Voice Events (with Audio)
 */
async function* ttsStream(
    eventStream: AsyncIterable<VoiceAgentEvent>,
    voiceId?: string
): AsyncGenerator<VoiceAgentEvent> {
    const tts = new OpenAITTSClient({
        voiceId: voiceId || "nova", // OpenAI TTS voice
    });
    const passthrough = writableIterator<VoiceAgentEvent>();

    const producer = iife(async () => {
        try {
            let buffer: string[] = [];
            for await (const event of eventStream) {
                passthrough.push(event);
                if (event.type === "agent_chunk") {
                    if (event.text && event.text.trim()) {
                        buffer.push(event.text);
                    }
                }
                if (event.type === "agent_end") {
                    const fullText = buffer.join("");
                    if (fullText.trim()) {
                        await tts.sendText(fullText);
                    }
                    buffer = [];
                }
            }
        } finally {
            await tts.close();
        }
    });

    const consumer = iife(async () => {
        for await (const chunk of tts.receiveEvents()) {
            passthrough.push({
                type: "tts_chunk",
                audio: chunk.audio.toString("base64"),
                done: chunk.done,
                ts: Date.now()
            });
        }
    });

    try {
        yield* passthrough;
    } finally {
        await Promise.all([producer, consumer]);
    }
}

function getWavHeader(dataLength: number, sampleRate: number, numChannels: number, bitsPerSample: number) {
    const header = Buffer.alloc(44);

    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataLength, 4);
    header.write('WAVE', 8);

    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // Subchunk1Size
    header.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // ByteRate
    header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // BlockAlign
    header.writeUInt16LE(bitsPerSample, 34);

    header.write('data', 36);
    header.writeUInt32LE(dataLength, 40);

    return header;
}

app.get("/voice/sample", async (c) => {
    const voiceId = c.req.query("voiceId");
    if (!voiceId) return c.text("Missing voiceId", 400);

    const tts = new OpenAITTSClient({ voiceId });
    const text = "Hello, I am ready to conduct your interview.";

    await tts.sendText(text);

    const chunks: Buffer[] = [];

    try {
        for await (const chunk of tts.receiveEvents()) {
            if (chunk.audio && chunk.audio.length > 0) {
                chunks.push(chunk.audio);
            }
            if (chunk.done) {
                break;
            }
        }
    } catch (e) {
        return c.text("TTS failed", 500);
    } finally {
        await tts.close();
    }

    const audioData = Buffer.concat(chunks);
    const wavHeader = getWavHeader(audioData.length, OPENAI_TTS_SAMPLE_RATE, 1, 16);
    const wavFile = Buffer.concat([wavHeader, audioData]);

    return c.body(wavFile, 200, {
        "Content-Type": "audio/wav",
    });
});


app.get(
    "/ws",
    upgradeWebSocket((c) => {
        const voiceId = c.req.query("voiceId");
        const sessionId = c.req.query("sessionId");
        const authToken = c.req.query("token");

        let currentSocket: WSContext<WebSocket> | undefined;
        let sessionContext: { resumeText?: string | null; jobDescription?: string | null } = {};
        const inputStream = writableIterator<Uint8Array>();
        const manualEventStream = writableIterator<VoiceAgentEvent>();
        const combinedEventStream = writableIterator<VoiceAgentEvent>();

        const sttStream = async function* (audioStream: AsyncIterable<Uint8Array>) {
            const stt = new AssemblyAISTT({ sampleRate: 16000 });
            const vadFiltered = vadStream(audioStream);

            // Send audio continuously without closing the connection
            iife(async () => {
                for await (const chunk of vadFiltered) {
                    await stt.sendAudio(chunk);
                }
                // Don't close STT - keep it open for the entire session
                // await stt.close();
            });

            yield* stt.receiveEvents();
        };

        const agentStream = async function* (sttEventStream: AsyncIterable<VoiceAgentEvent>) {
            const agentConfig = {
                configurable: { thread_id: sessionId || uuidv4() }
            };

            for await (const event of sttEventStream) {
                if (event.type === "stt_output") {
                    const isSystemContext = event.transcript.includes("SYSTEM CONTEXT");

                    if (!isSystemContext) {
                        yield event;
                    }

                    const stream = await agent.stream(
                        { messages: [new HumanMessage(event.transcript)] },
                        agentConfig
                    );

                    if (isSystemContext) {
                        for await (const chunk of stream) {
                        }
                    } else {
                        for await (const chunk of stream) {
                            if ("agent" in chunk) {
                                const agentMessages = chunk.agent.messages as any[];
                                for (const msg of agentMessages) {
                                    if (msg instanceof AIMessage) {
                                        if (msg.tool_calls && msg.tool_calls.length > 0) {
                                            for (const toolCall of msg.tool_calls) {
                                                yield {
                                                    type: "tool_call",
                                                    id: toolCall.id || "",
                                                    name: toolCall.name,
                                                    args: toolCall.args as Record<string, unknown>,
                                                    ts: Date.now()
                                                } as VoiceAgentEvent.ToolCall;
                                            }
                                        }
                                        if (msg.content && typeof msg.content === "string") {
                                            yield {
                                                type: "agent_chunk",
                                                text: msg.content,
                                                ts: Date.now()
                                            } as VoiceAgentEvent.AgentChunk;
                                        }
                                    } else if (msg instanceof ToolMessage) {
                                        yield {
                                            type: "tool_result",
                                            toolCallId: msg.tool_call_id || "",
                                            name: msg.name || "",
                                            result: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
                                            ts: Date.now()
                                        } as VoiceAgentEvent.ToolResult;
                                    }
                                }
                            }
                        }
                        yield { type: "agent_end", ts: Date.now() } as VoiceAgentEvent.AgentEnd;
                    }
                }
            }
        };

        const ttsStream = async function* (agentEventStream: AsyncIterable<VoiceAgentEvent>, voiceId?: string) {
            const tts = new OpenAITTSClient({ voiceId });
            let currentText = "";

            for await (const event of agentEventStream) {
                yield event;

                if (event.type === "agent_chunk") {
                    if (event.text && event.text.trim()) {
                        currentText += event.text;
                    }
                } else if (event.type === "agent_end") {
                    if (currentText.trim()) {
                        await tts.sendText(currentText);
                        for await (const ttsChunk of tts.receiveEvents()) {
                            const base64Audio = ttsChunk.audio.toString("base64");
                            yield {
                                type: "tts_chunk",
                                audio: base64Audio,
                                done: ttsChunk.done,
                                ts: Date.now()
                            } as VoiceAgentEvent.TTSChunk;
                        }
                        currentText = "";
                    }
                }
            }
        };


        // Process STT events from audio input
        iife(async () => {
            for await (const event of sttStream(inputStream)) combinedEventStream.push(event);
        });

        // Process manual events (system messages, end session, etc.)
        iife(async () => {
            for await (const event of manualEventStream) combinedEventStream.push(event);
        });

        const agentEventStream = agentStream(combinedEventStream);
        const outputEventStream = ttsStream(agentEventStream, voiceId);

        const flushPromise = iife(async () => {
            for await (const event of outputEventStream) {
                currentSocket?.send(JSON.stringify(event));
            }
        });

        return {
            async onOpen(_, ws) {
                currentSocket = ws;

                try {
                    if (sessionId) {
                        const db = await getPrisma();
                        const session = await db.interviewSession.findUnique({
                            where: { id: sessionId },
                            include: { user: true }
                        });

                        if (!session) {
                            ws.close(1008, "Invalid session");
                            return;
                        }

                        // Auth token validation commented out due to missing import
                        /*
                        if (authToken) {
                            // Validation logic here
                        }
                        */

                        sessionContext = {
                            resumeText: session.resumeText,
                            jobDescription: session.jobDescription
                        };

                        if (session.resumeText || session.jobDescription) {
                            const contextMessage = `SYSTEM CONTEXT
<session_id>${sessionId}</session_id>

<candidate_resume>
${session.resumeText || 'No resume provided'}
</candidate_resume>

<job_description>
${session.jobDescription || 'No job description provided'}
</job_description>

<instructions>
You now have the candidate's resume and the target job description. The interview has begun.
- Do NOT ask for resume or job description - you already have them
- Start by asking a behavioral question relevant to the role
- Use the resume to personalize questions about their specific experiences
- Use the job description to focus on relevant competencies
</instructions>`;

                            manualEventStream.push({
                                type: "stt_output",
                                transcript: contextMessage,
                                ts: Date.now()
                            });
                        }
                    }

                    let greeting = "Hello! I'm your AI interviewer today.";
                    let needsFirstQuestion = false;

                    if (sessionContext.resumeText && sessionContext.jobDescription) {
                        greeting = "Hello! I've reviewed your resume and the job description. I'm ready to begin your mock interview. Let's start with you telling me a bit about yourself and why you're interested in this role.";
                    } else if (sessionContext.resumeText) {
                        greeting = "Hello! I've reviewed your resume. Let's begin with you telling me about yourself and what kind of role you're looking for.";
                    } else {
                        greeting = "Hello! I'm your AI interviewer. Let's begin with you telling me a bit about yourself.";
                    }

                    const tts = new OpenAITTSClient({ voiceId: voiceId || "nova" });
                    await tts.sendText(greeting);

                    ws.send(JSON.stringify({ type: "agent_chunk", text: greeting }));

                    for await (const chunk of tts.receiveEvents()) {
                        ws.send(JSON.stringify({
                            type: "tts_chunk",
                            audio: chunk.audio.toString("base64"),
                            done: chunk.done
                        }));
                        if (chunk.done) {
                            break;
                        }
                    }

                    ws.send(JSON.stringify({ type: "tts_chunk", audio: "", done: true }));
                    await tts.close();
                } catch (err) {
                    ws.send(JSON.stringify({ type: "tts_chunk", audio: "", done: true }));
                }
            },
            onMessage(event) {
                const data = event.data;
                if (Buffer.isBuffer(data)) {
                    inputStream.push(new Uint8Array(data));
                } else if (data instanceof ArrayBuffer) {
                    inputStream.push(new Uint8Array(data));
                } else if (typeof data === "string") {
                    try {
                        const msg = JSON.parse(data);
                        if (msg.type === "end_session") {
                            manualEventStream.push({
                                type: "stt_output",
                                transcript: `<system_command>
<action>end_interview</action>
<session_id>${sessionId || "unknown"}</session_id>
<instructions>
The candidate has ended the interview. You must now:
1. ANALYZE THE TRANSCRIPT of the conversation. Do NOT use the resume for feedback - evaluate only what the candidate actually said.
2. Use the save_feedback tool to record your evaluation.
3. Strengths: List 3-5 specific things the candidate did well in their verbal answers (e.g. "Good use of STAR method in the leadership example").
4. Weaknesses: List 3-5 specific gaps in their answers (e.g. "Failed to quantify results in the project management question").
5. Priorities: List 3-5 actionable communication improvements for next time.
6. Score: 0-100 based strictly on the quality of their spoken answers.
7. questionFeedback: For each main question asked, provide an array with:
   - feedback: 2-3 specific observations about their answer to that question
   - score: 0-100 score for that specific question based on STAR completeness
8. After saving, briefly thank the candidate and say goodbye.
Do NOT speak the JSON data - just confirm feedback is saved.
</instructions>
</system_command>`,
                                ts: Date.now()
                            });
                        }
                    } catch (e) {
                    }
                }
            },
            async onClose() {
                inputStream.cancel();
                await flushPromise;
            },
        };
    })
);

export { app, injectWebSocket };

if (process.argv[1] === __filename) {
    const server = serve({
        fetch: app.fetch,
        port: PORT,
    });

    injectWebSocket(server);

}
