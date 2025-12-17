

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, CheckCircle2, AlertCircle, BarChart3, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryProps {
    strengths: string[];
    weaknesses: string[];
    roleFitScore: number;
    priorities: string[];
}

export function FeedbackSummary({ strengths, weaknesses, roleFitScore, priorities }: SummaryProps) {
    const scoreColor = roleFitScore >= 80 ? "text-green-600 dark:text-green-500" : roleFitScore >= 60 ? "text-amber-600 dark:text-amber-500" : "text-destructive";

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (roleFitScore / 100) * circumference;

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Hero Card - Role Fit Score */}
            <Card className="col-span-full">
                <CardHeader className="pb-2">
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>Comprehensive analysis of your interview performance</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-xl text-center md:text-left flex-1">
                            <div>
                                <h3 className="text-2xl font-bold tracking-tight">
                                    {roleFitScore >= 80 ? "Outstanding Interview" :
                                        roleFitScore >= 60 ? "Solid Performance" :
                                            "Needs Improvement"}
                                </h3>
                                <p className="text-muted-foreground mt-2 text-base leading-relaxed">
                                    {roleFitScore >= 80 ? "You demonstrated excellent alignment with the role requirements. Your answers were structured, specific, and impactful." :
                                        roleFitScore >= 60 ? "You have a good foundation but missed some opportunities to go deeper. Focus on quantifying your impact more clearly." :
                                            "Your answers didn't fully address the core competencies. Try to structure your responses using the STAR method."}
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                                <Badge variant="outline" className="px-3 py-1 font-normal bg-background">
                                    <BarChart3 className="w-3 h-3 mr-2" />
                                    7 Questions Analyzed
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1 font-normal bg-background">
                                    <Target className="w-3 h-3 mr-2" />
                                    Behavioral Focus
                                </Badge>
                            </div>
                        </div>

                        {/* Clean Circular Score */}
                        <div className="relative flex items-center justify-center shrink-0 w-48 h-48">
                            <svg className="transform -rotate-90 w-40 h-40">
                                {/* Background Ring */}
                                <circle
                                    className="text-muted/20"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r={radius}
                                    cx="50%"
                                    cy="50%"
                                />
                                {/* Progress Ring */}
                                <circle
                                    className="text-primary transition-all duration-1000 ease-out"
                                    strokeWidth="8"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    stroke="currentColor"
                                    r={radius}
                                    cx="50%"
                                    cy="50%"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={cn("text-4xl font-bold tracking-tighter", scoreColor)}>
                                    {roleFitScore}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Score</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Strengths */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Trophy className="h-4 w-4 text-primary" />
                        Key Strengths
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {strengths.map((str, i) => (
                            <li key={i} className="flex gap-3 text-sm items-start">
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{str}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        Growth Areas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {weaknesses.map((weak, i) => (
                            <li key={i} className="flex gap-3 text-sm items-start">
                                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">{weak}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Priorities */}
            <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Zap className="h-4 w-4 text-primary" />
                        Priorities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {priorities.map((p, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-md border bg-muted/30">
                                <div className="h-5 w-5 rounded-full bg-background border flex items-center justify-center text-[10px] font-bold shrink-0">
                                    {i + 1}
                                </div>
                                <span className="text-sm font-medium">{p}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
