"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Download, Share2, Check, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeedbackActionsProps {
    sessionId: string;
}

export function FeedbackActions({ sessionId }: FeedbackActionsProps) {
    const [copied, setCopied] = useState(false);

    const handleDownloadPDF = () => {
        window.print();
    };

    const handleShare = async () => {
        const url = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Interview Feedback - Interlume',
                    text: 'Check out my interview practice feedback!',
                    url: url,
                });
            } catch (e) {
                await copyToClipboard(url);
            }
        } else {
            await copyToClipboard(url);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Failed to copy", e);
        }
    };

    return (
        <div className="flex gap-2">
            <Link
                href="/interview/setup"
                className={cn(
                    buttonVariants({ size: "sm" }),
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm flex items-center"
                )}
            >
                <Plus className="mr-2 h-4 w-4" />
                New Practice
            </Link>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
                {copied ? (
                    <>
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Copied!
                    </>
                ) : (
                    <>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </>
                )}
            </Button>
        </div>
    );
}
