"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface MicControlProps {
    isListening: boolean;
    onToggle: () => void;
    disabled?: boolean;
}

export function MicControl({ isListening, onToggle, disabled }: MicControlProps) {
    return (
        <div className="relative group">
            {/* Pulse effect when listening */}
            {isListening && (
                <span className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping" />
            )}

            <Button
                variant={isListening ? "destructive" : "default"}
                size="icon"
                className={cn(
                    "h-16 w-16 rounded-full shadow-xl transition-all duration-300 relative z-10",
                    isListening ? "hover:bg-red-600 hover:scale-105" : "hover:scale-105"
                )}
                onClick={onToggle}
                disabled={disabled}
            >
                {isListening ? (
                    <Square className="h-6 w-6 fill-current" />
                ) : (
                    <Mic className="h-8 w-8" />
                )}
            </Button>

            <div className="mt-4 text-center">
                <span className={cn(
                    "text-xs font-medium uppercase tracking-wider transition-colors",
                    isListening ? "text-red-500" : "text-muted-foreground"
                )}>
                    {isListening ? "Listening..." : "Tap to Speak"}
                </span>
            </div>
        </div>
    );
}
