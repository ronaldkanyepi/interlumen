
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Activity, Trophy, Timer, Flame, Play, Calendar } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

function getRelativeTime(date: Date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString();
}

async function getStats(userId: string) {
    const [totalInterviews, avgScoreAgg, durationAgg, sessions, recentSessions] = await Promise.all([
        prisma.interviewSession.count({ where: { userId } }),
        prisma.interviewSession.aggregate({
            _avg: { score: true },
            where: { userId }
        }),
        prisma.interviewSession.aggregate({
            _sum: { duration: true },
            where: { userId }
        }),
        prisma.interviewSession.findMany({
            where: { userId },
            select: { createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        }),
        prisma.interviewSession.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5
        })
    ]);

    const avgScore = Math.round(avgScoreAgg._avg.score || 0);
    const hours = Math.round((durationAgg._sum.duration || 0) / 3600);

    const uniqueDates = Array.from(new Set<string>(sessions.map((s: { createdAt: Date }) => s.createdAt.toISOString().split('T')[0])));
    uniqueDates.sort((a: string, b: string) => b.localeCompare(a));

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates.length > 0) {
        if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
            streak = 1;
            let currentDate = new Date(uniqueDates[0]);
            for (let i = 1; i < uniqueDates.length; i++) {
                currentDate.setDate(currentDate.getDate() - 1);
                const prevDateStr = currentDate.toISOString().split('T')[0];
                if (uniqueDates[i] === prevDateStr) {
                    streak++;
                } else {
                    break;
                }
            }
        }
    }

    return {
        totalInterviews,
        avgScore,
        hours,
        streak,
        recentSessions
    };
}

export const dynamic = "force-dynamic";

export default async function HomePage() {
    let session = null;
    try {
        session = await auth.api.getSession({
            headers: await headers(),
        });
    } catch (e) {
        console.warn("Failed to get session in HomePage", e);
    }

    if (!session) {
        redirect("/auth/login");
    }

    let stats = {
        totalInterviews: 0,
        avgScore: 0,
        hours: 0,
        streak: 0,
        recentSessions: [] as any[]
    };

    try {
        stats = await getStats(session.user.id);
    } catch (e) {
        console.error("Failed to fetch stats", e);
    }

    return (
        <div className="grid gap-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome back, {session?.user.name?.split(' ')[0]}!</h2>
                    <p className="text-muted-foreground">Ready to ace your next interview?</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/interview/setup" className={cn(buttonVariants(), "w-full sm:w-auto gap-2")}>
                        <Play className="h-4 w-4" />
                        Start New Session
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalInterviews}</div>
                        <p className="text-xs text-muted-foreground">Lifetime sessions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.avgScore}%</div>
                        <p className="text-xs text-muted-foreground">Overall performance</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Practice Hours</CardTitle>
                        <Timer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.hours}h</div>
                        <p className="text-xs text-muted-foreground">Total practice time</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.streak} Days</div>
                        <p className="text-xs text-muted-foreground">Consistency is key!</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 md:col-span-2 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Performance History</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                            <div className="text-center space-y-2">
                                <Activity className="h-8 w-8 mx-auto opacity-50" />
                                <p>Performance chart will appear here after more sessions.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Sessions</CardTitle>
                        <CardDescription>
                            Your latest practice interviews.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentSessions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No sessions yet. Start one!</p>
                            ) : (
                                stats.recentSessions.map((session: any, i: number) => (
                                    <Link
                                        key={i}
                                        href={`/interview/feedback/${session.id}`}
                                        className="flex items-center p-2 -mx-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                                    >
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">{session.title}</p>
                                            <p className="text-xs text-muted-foreground">{session.type} • {getRelativeTime(session.createdAt)}</p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm text-muted-foreground group-hover:text-foreground">{session.score}%</div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
