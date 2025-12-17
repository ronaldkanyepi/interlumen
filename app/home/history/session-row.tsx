"use client";

import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface SessionRowProps {
    session: {
        id: string;
        title: string;
        type: string;
        createdAt: Date;
        duration: number;
        score: number;
    };
}

function getFormattedDate(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(date));
}

function formatDuration(seconds: number) {
    if (!seconds || seconds === 0) return "—";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
}

export function SessionRow({ session }: SessionRowProps) {
    const router = useRouter();

    return (
        <TableRow
            className="cursor-pointer hover:bg-muted/50 transition-colors group"
            onClick={() => router.push(`/interview/feedback/${session.id}`)}
        >
            <TableCell className="font-medium">
                <div className="flex flex-col">
                    <span className="group-hover:text-primary transition-colors">{session.title || "Untitled Session"}</span>
                    <span className="text-xs text-muted-foreground">{session.type}</span>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {getFormattedDate(session.createdAt)}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDuration(session.duration)}
                </div>
            </TableCell>
            <TableCell>
                {session.score > 0 ? (
                    <Badge
                        variant={session.score >= 80 ? "default" : session.score >= 60 ? "secondary" : "destructive"}
                        className={cn(
                            "font-mono",
                            session.score >= 80 ? "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25 border-green-500/20" :
                                session.score >= 60 ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/25 border-yellow-500/20" :
                                    ""
                        )}
                    >
                        {session.score}%
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-muted-foreground font-normal">Incomplete</Badge>
                )}
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="sr-only">View</span>
                </Button>
            </TableCell>
        </TableRow>
    );
}
