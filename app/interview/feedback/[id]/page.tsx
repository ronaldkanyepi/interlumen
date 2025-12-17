
import { FeedbackSummary } from "@/components/interview/feedback/feedback-summary";
import { QuestionFeedbackCard } from "@/components/interview/feedback/question-card";
import { FeedbackActions } from "@/components/interview/feedback/feedback-actions";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params }: PageProps) {
    const { id } = await params;
    let session = null;

    try {
        if (id !== "demo") {
            session = await auth.api.getSession({
                headers: await headers(),
            });
        }
    } catch (e) {
        console.warn("Failed to retrieve session in FeedbackPage", e);
    }

    let interview = null;

    if (id === "demo") {
    } else {
        if (!session) {
            redirect("/auth/login");
        }
        try {
            interview = await prisma.interviewSession.findUnique({
                where: { id },
                include: { questions: true }
            });
        } catch (e) {
            console.error("Failed to fetch interview session", e);
        }
    }

    if (!interview && id !== "demo") {
        notFound();
    }

    if (interview && session && interview.userId !== session.user.id) {
        redirect("/home");
    }

    const hasRealFeedback = interview && interview.feedbackSummary &&
        (interview.feedbackSummary as any)?.strengths?.length > 0;

    const demoSummary = {
        roleFitScore: 82,
        strengths: [
            "Clear communication of technical concepts.",
            "Good alignment with company values regarding user focus.",
            "Strong ownership demonstrated in project examples."
        ],
        weaknesses: [
            "Tendency to gloss over specific metrics in results phase.",
            "Could be more concise in initial situation setting.",
            "Missed opportunity to discuss cross-functional collaboration."
        ],
        priorities: [
            "Quantifying impact",
            "Conciseness",
            "Stakeholder management examples"
        ]
    };

    let summaryData;
    if (id === "demo") {
        summaryData = demoSummary;
    } else if (hasRealFeedback) {
        summaryData = {
            roleFitScore: interview!.score,
            strengths: ((interview!.feedbackSummary as any)?.strengths as string[]) || [],
            weaknesses: ((interview!.feedbackSummary as any)?.weaknesses as string[]) || [],
            priorities: ((interview!.feedbackSummary as any)?.priorities as string[]) || [],
        };
    } else {
        summaryData = {
            roleFitScore: interview?.score || 0,
            strengths: [],
            weaknesses: [],
            priorities: [],
        };
    }

    const questionData = interview?.questions.length ? interview.questions.map((q: any) => ({
        question: q.content,
        scores: { situation: 0, task: 0, action: 0, result: 0 },
        feedback: (q.feedback as any) || []
    })) : [];

    const sessionDate = interview ? new Date(interview.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

    return (
        <div className="min-h-screen bg-background relative selection:bg-primary/10">
            {/* Modern Background Pattern */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
            <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

            <div className="container py-12 px-4 max-w-7xl mx-auto space-y-10 print:py-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b pb-6">
                    <div className="space-y-4">
                        <Link
                            href="/home/history"
                            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4 print:hidden w-fit group"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            Back to History
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Interview Feedback
                            </h1>
                            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                                <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">#{id.slice(0, 8)}</span>
                                <span>•</span>
                                <span>{sessionDate}</span>
                            </div>
                        </div>
                    </div>
                    <div className="print:hidden shrink-0 mt-4 md:mt-0">
                        <FeedbackActions sessionId={id} />
                    </div>
                </div>

                {/* No Feedback Warning */}
                {!hasRealFeedback && id !== "demo" && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3 print:hidden">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-600 dark:text-amber-500">Interview Not Completed</p>
                            <p className="text-sm text-muted-foreground/90 mt-1">
                                This session was ended before the AI could generate detailed feedback.
                                Complete a full interview session to receive personalized analysis.
                            </p>
                        </div>
                    </div>
                )}

                {/* Summary Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold tracking-tight">Performance Summary</h2>
                            <p className="text-sm text-muted-foreground">Overall analysis of your interview performance.</p>
                        </div>
                    </div>
                    <FeedbackSummary {...summaryData} />
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-6">
                    <div className="border-t pt-8">
                        <h2 className="text-xl font-semibold tracking-tight mb-1">Question Breakdown</h2>
                        <p className="text-sm text-muted-foreground mb-6">Detailed feedback for each question answered.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {questionData.length > 0 ? questionData.map((q: any, i: number) => (
                            <div key={i} className="h-full">
                                <QuestionFeedbackCard {...q} />
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-12 border rounded-lg border-dashed text-muted-foreground bg-muted/30">
                                No detailed question feedback recorded for this session.
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Action */}
                <div className="flex justify-center pt-8 pb-12 print:hidden">
                    <Link
                        href="/interview/setup"
                        className={cn(buttonVariants({ size: "lg" }), "px-8")}
                    >
                        Start Another Practice Session
                    </Link>
                </div>
            </div>
        </div>
    );
}

