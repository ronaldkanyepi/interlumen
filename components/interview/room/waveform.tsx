"use client";

import { motion } from "framer-motion";

interface WaveformProps {
    isActive: boolean;
}

export function Waveform({ isActive }: WaveformProps) {
    return (
        <div className="flex items-center justify-center gap-1 h-12">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className={`w-1.5 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/30"}`}
                    animate={isActive ? {
                        height: [12, 32, 16, 40, 12][i % 5],
                        opacity: [0.5, 1, 0.5],
                    } : {
                        height: 4,
                        opacity: 0.3
                    }}
                    transition={isActive ? {
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: i * 0.1,
                    } : { duration: 0.5 }}
                />
            ))}
        </div>
    );
}
