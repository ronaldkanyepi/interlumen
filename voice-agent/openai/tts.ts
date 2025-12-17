import OpenAI from "openai";
import { writableIterator } from "../utils";

export interface OpenAITTSOptions {
    voiceId?: string;
}

export interface TTSChunk {
    audio: Buffer;
    done: boolean;
}

export type OpenAIVoice =
    | "alloy"
    | "echo"
    | "fable"
    | "onyx"
    | "nova"
    | "shimmer"
    | "ash"
    | "coral"
    | "sage";

const TTS_CONFIG = {
    MODEL: "tts-1",
    DEFAULT_VOICE: "nova" as OpenAIVoice,
    CHUNK_SIZE: 8192,
    SAMPLE_RATE: 24000,
} as const;

const VALID_VOICES: readonly OpenAIVoice[] = [
    "alloy", "echo", "fable", "onyx", "nova", "shimmer", "ash", "coral", "sage"
] as const;

export class OpenAITTSClient {
    private readonly client: OpenAI;
    private readonly voiceId: OpenAIVoice;
    private readonly bufferIterator = writableIterator<TTSChunk>();

    constructor(options: OpenAITTSOptions = {}) {
        this.client = new OpenAI();
        this.voiceId = this.validateVoice(options.voiceId);
    }

    private validateVoice(voice?: string): OpenAIVoice {
        if (voice && VALID_VOICES.includes(voice as OpenAIVoice)) {
            return voice as OpenAIVoice;
        }
        return TTS_CONFIG.DEFAULT_VOICE;
    }

    async sendText(text: string): Promise<void> {
        try {
            const response = await this.client.audio.speech.create({
                model: TTS_CONFIG.MODEL,
                voice: this.voiceId,
                input: text,
                response_format: "pcm",
            });

            const audioData = await this.processResponse(response);
            this.streamAudioChunks(audioData);
            this.sendDoneSignal();

        } catch (error) {
            this.sendDoneSignal();
            throw error;
        }
    }

    private async processResponse(response: Response): Promise<Buffer> {
        const arrayBuffer = await response.arrayBuffer();
        const audioData = Buffer.from(arrayBuffer);
        return audioData;
    }

    private streamAudioChunks(audioData: Buffer): void {
        for (let i = 0; i < audioData.length; i += TTS_CONFIG.CHUNK_SIZE) {
            const chunk = audioData.slice(i, Math.min(i + TTS_CONFIG.CHUNK_SIZE, audioData.length));
            this.bufferIterator.push({
                audio: chunk,
                done: false
            });
        }
    }

    private sendDoneSignal(): void {
        this.bufferIterator.push({
            audio: Buffer.alloc(0),
            done: true
        });
    }

    async *receiveEvents(): AsyncGenerator<TTSChunk> {
        yield* this.bufferIterator;
    }

    async close(): Promise<void> {
        this.bufferIterator.cancel();
    }
}

export const OPENAI_TTS_SAMPLE_RATE = TTS_CONFIG.SAMPLE_RATE;
