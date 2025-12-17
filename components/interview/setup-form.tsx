"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2,
    Mic,
    FileText,
    Upload,
    Briefcase,
    Play,
    Terminal,
    Trash2,
    Check
} from "lucide-react";
import { createInterviewSession } from "@/lib/actions/interview";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function InterviewSetupForm() {
    const router = useRouter();
    const [resume, setResume] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [seniority, setSeniority] = useState("mid");
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleStart = async () => {
        setIsLoading(true);
        try {
            const session = await createInterviewSession({
                title: `${seniority.charAt(0).toUpperCase() + seniority.slice(1)} Level Interview`,
                type: "Behavioral",
                resumeText: resume,
                jobDescription: jobDescription
            });
            router.push(`/interview/room/${session.id}`);
        } catch (error) {
            console.error("Failed to start session:", error);
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        setUploadedFile(file);

        // Handle text-based files
        if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) setResume(e.target.result as string);
            };
            reader.readAsText(file);
        }
        // Handle PDFs and other binary files
        else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
            // For PDFs, we accept the file but can't preview it
            // The file is uploaded and the user should paste the text content
            setResume(""); // Clear any existing text
        }
        // Unsupported file types
        else {
            setUploadedFile(null);
            alert("Please upload a .txt, .md, or .pdf file. For best results with PDFs, copy and paste the text content directly.");
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    }, []);

    const isValid = (resume.trim().length > 50 || uploadedFile) && jobDescription.trim().length > 50;

    return (
        <div
            className="w-full h-full flex flex-col bg-card/50 backdrop-blur-sm border rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Toolbar Header */}
            <div className="h-14 border-b bg-muted/10 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Terminal className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-sm font-semibold tracking-wide text-foreground">Interview Context</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Configuration</p>
                    </div>
                </div>

                {/* Global Actions / Stats? */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${resume.length > 50 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-zinc-600'}`} />
                        <span>Resume</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${jobDescription.length > 50 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-zinc-600'}`} />
                        <span>Job</span>
                    </div>
                </div>
            </div>

            {/* Main Split Editor */}
            <div className="flex-1 flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x overflow-hidden">

                {/* Left Pane: Resume */}
                <div className="flex-1 flex flex-col min-w-0 bg-background/30 relative group">
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="h-10 border-b flex items-center justify-between px-4 bg-muted/5 shrink-0 z-10">
                        <div className="flex items-center gap-2">
                            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-mono text-muted-foreground">resume.md</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".txt,.md,.pdf"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1.5 hover:bg-muted"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-3 w-3" />
                                {uploadedFile ? "Replace" : "Import"}
                            </Button>
                            {uploadedFile && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                    onClick={() => { setUploadedFile(null); setResume(""); }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        {uploadedFile && !resume ? (
                            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                                <div className="space-y-3">
                                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Check className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{uploadedFile.name}</p>
                                        <p className="text-xs text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB loaded</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Textarea
                                className="absolute inset-0 w-full h-full resize-none border-0 focus-visible:ring-0 rounded-none p-6 font-mono text-sm leading-relaxed bg-transparent selection:bg-primary/20 placeholder:text-muted-foreground/20"
                                placeholder="// Paste your resume here or drag & drop a file..."
                                value={resume}
                                onChange={(e) => setResume(e.target.value)}
                            />
                        )}
                    </div>
                </div>

                {/* Right Pane: Job Description */}
                <div className="flex-1 flex flex-col min-w-0 bg-background/30 relative group">
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="h-10 border-b flex items-center justify-between px-4 bg-muted/5 shrink-0 z-10">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-mono text-muted-foreground">job_description.txt</span>
                        </div>
                    </div>

                    <div className="flex-1 relative">
                        <Textarea
                            className="absolute inset-0 w-full h-full resize-none border-0 focus-visible:ring-0 rounded-none p-6 font-mono text-sm leading-relaxed bg-transparent selection:bg-primary/20 placeholder:text-muted-foreground/20"
                            placeholder="// Paste the job description and requirements..."
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Footer Control Plane */}
            <div className="min-h-[4rem] h-auto py-3 sm:py-0 border-t bg-muted/5 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 shrink-0 z-20 gap-3 sm:gap-0">
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Seniority</label>
                        <Select value={seniority} onValueChange={(val: string | null) => val && setSeniority(val)}>
                            <SelectTrigger className="h-8 w-full sm:w-[140px] bg-background border-border/50 text-xs shadow-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="junior">Junior</SelectItem>
                                <SelectItem value="mid">Mid-Level</SelectItem>
                                <SelectItem value="senior">Senior</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator orientation="vertical" className="h-8 hidden sm:block" />

                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                        <Mic className="h-3.5 w-3.5" />
                        <span>Microphone ready</span>
                    </div>
                </div>

                <Button
                    onClick={handleStart}
                    disabled={!isValid || isLoading}
                    className="w-full sm:w-auto h-10 px-6 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Initializing...
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-3.5 w-3.5 fill-current" />
                            Start Session
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
