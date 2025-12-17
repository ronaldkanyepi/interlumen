import WebSocket from "ws";
import { writableIterator } from "../utils";
import type { AssemblyAISTTMessage } from "./api-types";
import type { VoiceAgentEvent } from "../types";

interface AssemblyAISTTOptions {
    apiKey?: string;
    sampleRate?: number;
    formatTurns?: boolean;
}

const STT_CONFIG = {
    DEFAULT_SAMPLE_RATE: 16000,
    DEFAULT_FORMAT_TURNS: true,
    MIN_BUFFER_SIZE: 3200,
    END_UTTERANCE_SILENCE_THRESHOLD: "700",
    WS_BASE_URL: "wss://streaming.assemblyai.com/v3/ws",
} as const;

export class AssemblyAISTT {
    private readonly apiKey: string;
    private readonly sampleRate: number;
    private readonly formatTurns: boolean;
    private readonly bufferIterator = writableIterator<VoiceAgentEvent.STTEvent>();

    private connectionPromise: Promise<WebSocket> | null = null;
    private audioBuffer: Uint8Array = new Uint8Array(0);
    private closed = false;

    constructor(options: AssemblyAISTTOptions) {
        this.apiKey = options.apiKey || process.env.ASSEMBLYAI_API_KEY || "";
        this.sampleRate = options.sampleRate || STT_CONFIG.DEFAULT_SAMPLE_RATE;
        this.formatTurns = options.formatTurns ?? STT_CONFIG.DEFAULT_FORMAT_TURNS;

        if (!this.apiKey) {
            throw new Error("AssemblyAI API key is required");
        }
    }

    private get connection(): Promise<WebSocket> {
        if (this.connectionPromise) {
            return this.connectionPromise;
        }

        this.connectionPromise = this.createConnection();
        return this.connectionPromise;
    }

    private createConnection(): Promise<WebSocket> {
        return new Promise((resolve, reject) => {
            const url = this.buildWebSocketURL();

            const ws = new WebSocket(url, {
                headers: { Authorization: this.apiKey },
            });

            this.setupWebSocketHandlers(ws, resolve, reject);
        });
    }

    private buildWebSocketURL(): string {
        const params = new URLSearchParams({
            sample_rate: this.sampleRate.toString(),
            format_turns: this.formatTurns.toString().toLowerCase(),
            end_utterance_silence_threshold: STT_CONFIG.END_UTTERANCE_SILENCE_THRESHOLD,
        });

        return `${STT_CONFIG.WS_BASE_URL}?${params.toString()}`;
    }

    private setupWebSocketHandlers(
        ws: WebSocket,
        resolve: (ws: WebSocket) => void,
        reject: (error: Error) => void
    ): void {
        ws.on("open", () => {
            resolve(ws);
        });

        ws.on("message", (data: WebSocket.RawData) => this.handleMessage(data));
        ws.on("error", (error) => this.handleError(error, reject));
        ws.on("close", (code, reason) => this.handleClose(code, reason));
    }

    private handleMessage(data: WebSocket.RawData): void {
        try {
            const message: AssemblyAISTTMessage = JSON.parse(data.toString());
            this.processMessage(message);
        } catch (error) {
        }
    }

    private processMessage(message: AssemblyAISTTMessage): void {
        switch (message.type) {
            case "Begin":
                break;

            case "Turn":
                this.processTurnMessage(message);
                break;

            case "Termination":
                break;

            case "Error":
                throw new Error(message.error);
        }
    }

    private processTurnMessage(message: AssemblyAISTTMessage.Turn): void {
        if (message.turn_is_formatted) {
            if (message.transcript) {
                this.bufferIterator.push({
                    type: "stt_output",
                    transcript: message.transcript,
                    ts: Date.now()
                });
            }
        } else {
            this.bufferIterator.push({
                type: "stt_chunk",
                transcript: message.transcript,
                ts: Date.now()
            });
        }
    }

    private handleError(error: Error, reject: (error: Error) => void): void {
        this.closed = true;
        this.bufferIterator.cancel();
        reject(error);
    }

    private handleClose(code: number, reason: Buffer): void {
        this.closed = true;
        this.connectionPromise = null;
    }

    async sendAudio(buffer: Uint8Array): Promise<void> {
        if (this.closed) return;

        this.audioBuffer = this.concatenateBuffers(this.audioBuffer, buffer);

        if (this.audioBuffer.length >= STT_CONFIG.MIN_BUFFER_SIZE) {
            await this.flushBuffer();
        }
    }

    private concatenateBuffers(buffer1: Uint8Array, buffer2: Uint8Array): Uint8Array {
        const newBuffer = new Uint8Array(buffer1.length + buffer2.length);
        newBuffer.set(buffer1);
        newBuffer.set(buffer2, buffer1.length);
        return newBuffer;
    }

    private async flushBuffer(): Promise<void> {
        try {
            const conn = await this.connection;
            conn.send(this.audioBuffer);
            this.audioBuffer = new Uint8Array(0);
        } catch (e) {
            this.closed = true;
        }
    }

    async flushAudio(): Promise<void> {
        if (this.audioBuffer.length > 0) {
            await this.flushBuffer();
        }
    }

    async *receiveEvents(): AsyncGenerator<VoiceAgentEvent.STTEvent> {
        yield* this.bufferIterator;
    }

    async close(): Promise<void> {
        if (this.connectionPromise) {
            const ws = await this.connectionPromise;
            ws.close();
        }
    }
}
