"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { MicControl } from "./mic-control";
import { Waveform } from "./waveform";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut, Volume2, Loader2, AlertCircle } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { updateInterviewSession } from "@/lib/actions/interview";

interface InterviewRoomViewProps {
    sessionId?: string;
}

type ConnectionStatus = "connecting" | "connected" | "error" | "closed";
type InterviewStatus = "waiting" | "idle" | "listening" | "processing" | "speaking";

export function InterviewRoomView({ sessionId = "demo" }: InterviewRoomViewProps) {
    const router = useRouter();
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
    const [interviewStatus, setInterviewStatus] = useState<InterviewStatus>("waiting");
    const [agentMessage, setAgentMessage] = useState<string>("Connecting to interview agent...");
    const [transcript, setTranscript] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isAudioReady, setIsAudioReady] = useState(false);
    const [isPending, startTransition] = useTransition();

    const wsRef = useRef<WebSocket | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const audioQueueRef = useRef<ArrayBuffer[]>([]);
    const isPlayingRef = useRef<boolean>(false);
    const isAudioReadyRef = useRef(false);
    const autoStopTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let isMounted = true;
        let wsUrl = process.env.NEXT_PUBLIC_VOICE_AGENT_WS_URL;

        if (!wsUrl) {
            if (typeof window !== 'undefined') {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    wsUrl = "ws://localhost:8000/ws";
                } else {
                    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                    wsUrl = `${protocol}//${window.location.host}/ws`;
                }
            } else {
                wsUrl = "ws://localhost:8000/ws";
            }
        }

        const storedVoice = localStorage.getItem("interview_voice_id");

        const params = new URLSearchParams();
        if (storedVoice) params.set("voiceId", storedVoice);
        if (sessionId && sessionId !== "demo") params.set("sessionId", sessionId);

        const queryString = params.toString();
        if (queryString) {
            wsUrl += (wsUrl.includes('?') ? '&' : '?') + queryString;
        }

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = async () => {
            if (!isMounted) return;
            setConnectionStatus("connected");
            setAgentMessage("Connecting to interviewer...");
            setError(null);

            try {
                const ctx = new AudioContext();
                if (ctx.state === 'suspended') {
                    await ctx.resume();
                }
                playbackAudioContextRef.current = ctx;
                setIsAudioReady(true);
                isAudioReadyRef.current = true;

                if (!isPlayingRef.current) {
                    playNextAudio();
                }
            } catch (e) {
                console.error("Failed to init audio", e);
            }
        };

        ws.onmessage = (event) => {
            if (!isMounted) return;
            try {
                const data = JSON.parse(event.data);
                handleVoiceEvent(data);
            } catch {
                if (event.data instanceof Blob) {
                    event.data.arrayBuffer().then(buffer => {
                        if (isMounted) {
                            audioQueueRef.current.push(buffer);
                            playNextAudio();
                        }
                    });
                }
            }
        };

        ws.onerror = () => {
            if (!isMounted) return;
            setConnectionStatus("error");
            setError("Failed to connect to interview agent. Run: npm run dev:voice");
        };

        ws.onclose = () => {
            if (!isMounted) return;
            setConnectionStatus("closed");
        };

        return () => {
            isMounted = false;
            ws.close();
            cleanupRecording();
        };
    }, []);

    const isTTSStreamDoneRef = useRef(false);

    const handleVoiceEvent = (event: any) => {
        switch (event.type) {
            case "stt_output":
                setTranscript(event.transcript);
                setInterviewStatus("processing");
                cleanupRecording();
                isTTSStreamDoneRef.current = false;
                break;
            case "agent_chunk":
                setAgentMessage(prev => {
                    if (interviewStatus !== "speaking") {
                        setInterviewStatus("speaking");
                        return event.text;
                    }
                    return prev + event.text;
                });
                break;
            case "tts_chunk":
                if (event.audio) {
                    const binary = atob(event.audio);
                    const bytes = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }
                    audioQueueRef.current.push(bytes.buffer);
                    if (!isPlayingRef.current && isAudioReadyRef.current) {
                        playNextAudio();
                    }
                }
                if (event.done) {
                    isTTSStreamDoneRef.current = true;
                }
                break;
        }
    };

    const playbackAudioContextRef = useRef<AudioContext | null>(null);

    const playNextAudio = async () => {
        if (audioQueueRef.current.length === 0) {
            isPlayingRef.current = false;
            if (isTTSStreamDoneRef.current) {
                console.log("[Playback] TTS complete, auto-starting mic...");
                setInterviewStatus("listening");
                setAgentMessage("I'm listening...");
                try {
                    await startRecording(false); // Don't set message again, we just set it above
                } catch (err) {
                    console.error("[Playback] Failed to auto-start recording:", err);
                }
            }
            return;
        }

        isPlayingRef.current = true;
        setInterviewStatus("speaking");
        const buffer = audioQueueRef.current.shift()!;

        try {
            if (!playbackAudioContextRef.current) {
                playbackAudioContextRef.current = new AudioContext(); // System default is fine (usually 44.1k or 48k)
            }
            const ctx = playbackAudioContextRef.current;

            if (ctx.state === 'suspended') {
                await ctx.resume();
            }


            const safeByteLength = buffer.byteLength - (buffer.byteLength % 2);
            const int16Data = new Int16Array(buffer, 0, safeByteLength / 2);

            const audioBuffer = ctx.createBuffer(1, int16Data.length, 24000); // 24kHz Native Rate
            const channelData = audioBuffer.getChannelData(0);

            for (let i = 0; i < int16Data.length; i++) {
                channelData[i] = int16Data[i] / 32768.0;
            }

            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => {
                isPlayingRef.current = false;
                playNextAudio();
            };
            source.start();
        } catch (err) {
            console.error("Playback error:", err);
            isPlayingRef.current = false;
            playNextAudio();
        }
    };

    const startRecording = async (setMessage = true) => {
        try {
            console.log("[Mic] Starting recording...");
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true }
            });
            console.log("[Mic] Got media stream");
            mediaStreamRef.current = stream;
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            let chunksSent = 0;
            processor.onaudioprocess = (e) => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const int16Data = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                    }
                    wsRef.current.send(int16Data.buffer);
                    chunksSent++;
                    if (chunksSent === 1 || chunksSent % 50 === 0) {
                        console.log(`[Mic] Sent chunk #${chunksSent}, size: ${int16Data.buffer.byteLength}`);
                    }
                }
            };

            source.connect(processor);
            processor.connect(audioContext.destination);
            setInterviewStatus("listening");
            if (setMessage) {
                setAgentMessage("I'm listening...");
            }

            // Auto-stop after 30 seconds
            autoStopTimerRef.current = setTimeout(() => {
                console.log("[Mic] Auto-stopping after 30 seconds");
                stopRecording();
            }, 30000);

            console.log("[Mic] Recording started successfully");
        } catch (err) {
            console.error("[Mic] Error starting recording:", err);
            setError("Could not access microphone. Please allow permissions.");
        }
    };

    const cleanupRecording = () => {
        if (autoStopTimerRef.current) {
            clearTimeout(autoStopTimerRef.current);
            autoStopTimerRef.current = null;
        }
        processorRef.current?.disconnect();
        processorRef.current = null;
        audioContextRef.current?.close();
        audioContextRef.current = null;
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    };

    const stopRecording = () => {
        cleanupRecording();
        if (interviewStatus === "listening") setInterviewStatus("processing");
    };

    const toggleMic = () => {
        if (interviewStatus === "listening") stopRecording();
        else if (interviewStatus === "idle") startRecording();
    };



    const handleEndInterview = () => {
        startTransition(async () => {
            try {
                stopRecording();

                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({ type: "end_session" }));
                    await new Promise(resolve => setTimeout(resolve, 8000));
                }

                wsRef.current?.close();

                if (sessionId !== "demo") {
                    router.push(`/interview/feedback/${sessionId}`);
                } else {
                    router.push(`/interview/feedback/demo`);
                }
            } catch (err) {
                console.error("Failed to update session", err);
                router.push(sessionId !== "demo" ? `/interview/feedback/${sessionId}` : '/dashboard');
            }
        });
    };


    const isMicActive = interviewStatus === "listening";
    const isDisabled = connectionStatus !== "connected" || interviewStatus === "waiting" || interviewStatus === "processing" || interviewStatus === "speaking";

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full relative">
            <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={`h-2 w-2 rounded-full ${connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                        connectionStatus === 'connected' ? 'bg-green-500' :
                            connectionStatus === 'error' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                    {connectionStatus === 'connecting' && 'Connecting...'}
                    {connectionStatus === 'connected' && 'Live Session'}
                    {connectionStatus === 'error' && 'Connection Error'}
                    {connectionStatus === 'closed' && 'Disconnected'}
                </div>

                <AlertDialog>
                    <AlertDialogTrigger
                        render={<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500" />}
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        End Interview
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>End Interview?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will conclude the session and generate your feedback.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleEndInterview(); }} className="bg-red-500 hover:bg-red-600">
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                End & Get Feedback
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {error && (
                <div className="mx-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-500">Connection Error</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
                {/* Turn Indicator Banner */}
                <div className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wide transition-all duration-300 ${interviewStatus === 'speaking' ? 'bg-primary/10 text-primary border border-primary/20' :
                    interviewStatus === 'listening' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                        interviewStatus === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                            'bg-secondary text-secondary-foreground border border-border'
                    }`}>
                    {interviewStatus === 'speaking' && 'Agent Speaking'}
                    {interviewStatus === 'listening' && 'Adjusting Audio Level...'}
                    {/* Note: In continuous mode, this state might need refining */}
                    {interviewStatus === 'processing' && 'Processing Response'}
                    {interviewStatus === 'waiting' && 'Connecting...'}
                    {interviewStatus === 'idle' && 'Ready'}
                </div>

                {/* Agent Message Display */}
                <div className="text-center space-y-6 max-w-2xl">
                    <div className={`inline-flex items-center justify-center p-6 rounded-full transition-all duration-500 ${interviewStatus === 'speaking' ? 'bg-primary/5 scale-105' : 'bg-secondary/30'
                        }`}>
                        <Volume2 className={`h-10 w-10 ${interviewStatus === 'speaking' ? 'text-primary animate-pulse' : 'text-muted-foreground/50'
                            }`} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl md:text-2xl font-medium leading-relaxed tracking-tight text-foreground">
                            {agentMessage || "Waiting for session to start..."}
                        </h2>
                    </div>
                </div>

                {/* User's Transcript */}
                {transcript && (
                    <div className="w-full max-w-lg">
                        <div className="bg-secondary/20 border border-border/50 rounded-lg px-4 py-3 text-center">
                            <p className="text-sm text-foreground/80 italic leading-relaxed">"{transcript}"</p>
                        </div>
                    </div>
                )}

                {/* Visualizer Area */}
                <div className="h-16 flex items-center justify-center w-full">
                    {isMicActive ? (
                        <Waveform isActive={true} />
                    ) : null}
                </div>
            </div>

            {/* Bottom Mic Control */}
            <div className="p-8 pb-12 flex flex-col justify-center items-center gap-3">
                <MicControl isListening={isMicActive} onToggle={toggleMic} disabled={isDisabled} />
                <p className={`text-xs transition-colors ${isDisabled ? 'text-muted-foreground/30' : 'text-muted-foreground'
                    }`}>
                    {isDisabled ?
                        (interviewStatus === 'waiting' ? 'Waiting for agent...' :
                            interviewStatus === 'speaking' ? 'Wait for agent to finish' :
                                interviewStatus === 'processing' ? 'Agent is thinking...' :
                                    'Mic disabled') :
                        (isMicActive ? 'Speaking... (pause to finish)' : 'Ready to listen')
                    }
                </p>
            </div>


        </div>
    );
}
