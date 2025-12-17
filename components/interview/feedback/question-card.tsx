
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Lightbulb, MessageSquare } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface FeedbackPoint {
    type: "positive" | "negative" | "improvement";
    text: string;
}

interface QuestionFeedbackProps {
    question: string;
    scores: {
        situation: number;
        task: number;
        action: number;
        result: number;
    };
    feedback: FeedbackPoint[];
}

function StarScoreIndicator({ label, description, score }: { label: string, description: string, score: number }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-full border-2 border-muted">
                 <div className="text-lg font-bold">{score}</div>
            </div>
            <div className="text-center">
                <div className="text-xs font-bold text-muted-foreground uppercase">{label}</div>
            </div>
        </div>
    );
}

export function QuestionFeedbackCard({ question, scores, feedback }: QuestionFeedbackProps) {
    const averageScore = Math.round((scores.situation + scores.task + scores.action + scores.result) / 4);

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <MessageSquare className="w-3.5 h-3.5" />
                            Question Analysis
                        </div>
                        <h3 className="font-semibold text-lg leading-tight">{question}</h3>
                    </div>
                    <Badge variant={averageScore >= 8 ? "default" : averageScore >= 5 ? "secondary" : "destructive"}>
                        {averageScore}/10
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* STAR Scores */}
                <div className="grid grid-cols-4 gap-4 pb-2">
                    <StarScoreIndicator label="Situation" description="Context" score={scores.situation} />
                    <StarScoreIndicator label="Task" description="Challenge" score={scores.task} />
                    <StarScoreIndicator label="Action" description="Solution" score={scores.action} />
                    <StarScoreIndicator label="Result" description="Outcome" score={scores.result} />
                </div>

                <Separator />

                {/* Feedback Points */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground">Detailed Feedback</h4>
                    {feedback.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-start p-3 rounded-lg border bg-muted/20 text-sm">
                            <div className="mt-0.5 shrink-0">
                                {item.type === 'positive' && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />}
                                {item.type === 'negative' && <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-500" />}
                                {item.type === 'improvement' && <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-500" />}
                            </div>
                            <div className="leading-relaxed text-muted-foreground">
                                {item.text}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
