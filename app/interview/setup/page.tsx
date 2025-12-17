import { InterviewSetupForm } from "@/components/interview/setup-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function InterviewSetupPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto p-4 md:p-8 flex flex-col max-w-6xl h-[calc(100vh-4rem)] min-h-[600px] max-h-[800px]">
                <div className="flex-none mb-6">
                    <Link
                        href="/home"
                        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="flex-1 min-h-0">
                    <InterviewSetupForm />
                </div>
            </div>
        </div>
    );
}
