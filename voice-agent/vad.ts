/**
 * Simple Energy-based Voice Activity Detection (VAD).
 * Filters out audio frames that are below a certain RMS threshold.
 */
const VAD_CONFIG = {
    THRESHOLD: 5,
    FRAME_SIZE: 512,
    BUFFER_FRAMES: 150,
    WARMUP_FRAMES: 20,
} as const;

export async function* vadStream(
    audioStream: AsyncIterable<Uint8Array>,
    threshold: number = VAD_CONFIG.THRESHOLD
): AsyncGenerator<Uint8Array> {
    let internalBuffer = new Uint8Array(0);
    let frameCount = 0;
    let passedCount = 0;
    let silentFramesSinceLastSpeech = 0;
    let hasDetectedSpeech = false;

    for await (const chunk of audioStream) {
        internalBuffer = concatenateBuffers(internalBuffer, chunk);

        while (internalBuffer.length >= VAD_CONFIG.FRAME_SIZE * 2) {
            const frameBytes = internalBuffer.slice(0, VAD_CONFIG.FRAME_SIZE * 2);
            internalBuffer = internalBuffer.slice(VAD_CONFIG.FRAME_SIZE * 2);
            frameCount++;

            const rms = calculateRMS(frameBytes);
            const isSpeech = rms > threshold;

            if (shouldPassFrame(isSpeech, hasDetectedSpeech, silentFramesSinceLastSpeech, frameCount)) {
                if (isSpeech) {
                    hasDetectedSpeech = true;
                    silentFramesSinceLastSpeech = 0;
                } else if (hasDetectedSpeech) {
                    silentFramesSinceLastSpeech++;
                }
                passedCount++;
                yield frameBytes;
            }
        }
    }

}

function concatenateBuffers(buffer1: Uint8Array, buffer2: Uint8Array): Uint8Array {
    const newBuffer = new Uint8Array(buffer1.length + buffer2.length);
    newBuffer.set(buffer1);
    newBuffer.set(buffer2, buffer1.length);
    return newBuffer;
}

function calculateRMS(frameBytes: Uint8Array): number {
    const int16Frame = new Int16Array(
        frameBytes.buffer,
        frameBytes.byteOffset,
        frameBytes.byteLength / 2
    );

    let sumSquares = 0;
    for (let i = 0; i < int16Frame.length; i++) {
        sumSquares += int16Frame[i] * int16Frame[i];
    }

    return Math.sqrt(sumSquares / int16Frame.length);
}

function shouldPassFrame(
    isSpeech: boolean,
    hasDetectedSpeech: boolean,
    silentFrames: number,
    frameCount: number
): boolean {
    if (isSpeech) return true;
    if (hasDetectedSpeech && silentFrames < VAD_CONFIG.BUFFER_FRAMES) return true;
    if (frameCount < VAD_CONFIG.WARMUP_FRAMES) return true;
    return false;
}
