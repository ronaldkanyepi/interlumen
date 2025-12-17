import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Play, BarChart3, Trophy, History as HistoryIcon } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { SessionRow } from "./session-row";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: await headers(),
        });
    } catch (e) {
        console.warn("Failed to get session", e);
    }

    if (!session) {
        redirect("/auth/login");
    }

    let sessions: any[] = [];
    try {
        sessions = await prisma.interviewSession.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    } catch (e) {
        console.error("Failed to fetch sessions", e);
    }

    const completedSessions = sessions.filter(s => s.score > 0);
    const averageScore = completedSessions.length > 0
        ? Math.round(completedSessions.reduce((acc, s) => acc + s.score, 0) / completedSessions.length)
        : null;
    const bestScore = completedSessions.length > 0
        ? Math.max(...completedSessions.map(s => s.score))
        : null;
    const totalPracticeTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    const totalHours = Math.floor(totalPracticeTime / 3600);
    const totalMins = Math.floor((totalPracticeTime % 3600) / 60);

    return (
        <div className="space-y-8 container max-w-6xl mx-auto py-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Interview History</h1>
                    <p className="text-muted-foreground mt-1">
                        Track your progress and review feedback from past sessions.
                    </p>
                </div>
                <Link href="/interview/setup" className={cn(buttonVariants({ size: "default" }), "gap-2 shadow-sm")}>
                    <Play className="h-4 w-4" />
                    Start New Session
                </Link>
            </div>

            {/* Stats Overview */}
            {sessions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                            <HistoryIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{sessions.length}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {totalHours > 0 ? `${totalHours}h ` : ""}{totalMins}m total practice time
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{averageScore ? `${averageScore}%` : "—"}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Across {completedSessions.length} completed sessions
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Best Performance</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{bestScore ? `${bestScore}%` : "—"}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Your personal record
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Sessions Table */}
            <Card className="border shadow-sm">
                <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>
                        A list of your recent interview practice sessions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {sessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                <HistoryIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-1">No sessions logged</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                You haven't engaged in any interview sessions yet. Start practicing to see your history here.
                            </p>
                            <Link href="/interview/setup" className={cn(buttonVariants({ variant: "outline" }), "gap-2")}>
                                <Play className="h-4 w-4" />
                                Start Practice
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Session Name</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Score</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.map((s: any) => (
                                    <SessionRow key={s.id} session={s} />
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
