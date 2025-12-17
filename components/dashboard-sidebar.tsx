"use client";

import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Shield, Bell, Database, ChevronRight, Play, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getUserHistory, deleteUserHistory } from "@/lib/actions/interview";


import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface DashboardSidebarProps {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
}

const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "account", label: "Account", icon: User },
    { id: "data_controls", label: "Data controls", icon: Database },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
];

const VOICES = [
    { id: "alloy", name: "Alloy", description: "Neutral and balanced" },
    { id: "echo", name: "Echo", description: "Clear and articulate" },
    { id: "fable", name: "Fable", description: "Warm and expressive" },
    { id: "onyx", name: "Onyx", description: "Deep and authoritative" },
    { id: "nova", name: "Nova (Default)", description: "Friendly and conversational" },
    { id: "shimmer", name: "Shimmer", description: "Bright and energetic" },
    { id: "ash", name: "Ash", description: "Smooth and professional" },
    { id: "coral", name: "Coral", description: "Warm and engaging" },
    { id: "sage", name: "Sage", description: "Calm and measured" },
];

export function DashboardSidebar({ user }: DashboardSidebarProps) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState("general");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState("nova");
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);

    useEffect(() => {
        const storedVoice = localStorage.getItem("interview_voice_id");
        if (storedVoice) {
            const exists = VOICES.find(v => v.id === storedVoice);
            if (exists) {
                setSelectedVoice(storedVoice);
            }
        }
    }, []);

    const handleVoiceChange = (voiceId: string | null) => {
        if (!voiceId) return;
        setSelectedVoice(voiceId);
        localStorage.setItem("interview_voice_id", voiceId);
    };

    const handlePlayVoice = () => {
        if (isPlayingVoice) return;
        setIsPlayingVoice(true);

        try {
            const wsUrl = process.env.NEXT_PUBLIC_VOICE_AGENT_WS_URL || "ws://localhost:8000/ws";
            const httpBase = wsUrl.replace("wss://", "https://").replace("ws://", "http://").replace(/\/ws$/, "");

            const audio = new Audio(`${httpBase}/voice/sample?voiceId=${selectedVoice}`);

            audio.onended = () => setIsPlayingVoice(false);
            audio.onerror = (e) => {
                console.error("Audio playback error", e);
                setIsPlayingVoice(false);
                alert("Playback failed. Please ensure the voice agent is running via 'npm run dev:voice'");
            };

            audio.play().catch(e => {
                console.error("Play failed", e);
                setIsPlayingVoice(false);
            });
        } catch (e) {
            console.error(e);
            setIsPlayingVoice(false);
        }
    };

    const handleExportHistory = async () => {
        try {
            const history = await getUserHistory();
            if (!history || history.length === 0) {
                alert("No history to export.");
                return;
            }

            const dataStr = JSON.stringify(history, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

            const exportFileDefaultName = `interlume-history-${new Date().toISOString().split('T')[0]}.json`;

            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } catch (e) {
            console.error(e);
            alert("Failed to export history.");
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteUserHistory();
            toast.success("Interview history deleted successfully");
            setIsSettingsOpen(false);
            window.location.reload();
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete interview history");
        }
    };

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/");
                },
            },
        });
    };

    return (
        <>
            <DashboardNav onOpenSettings={() => setIsSettingsOpen(true)} />

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent className="sm:max-w-4xl w-[95vw] h-[85vh] md:h-[600px] p-0 gap-0 overflow-hidden flex flex-col md:flex-row">
                    <DialogTitle className="sr-only">User Settings</DialogTitle>
                    <DialogDescription className="sr-only">Manage your account settings</DialogDescription>

                    {/* Sidebar */}
                    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r bg-muted/30 p-2 md:p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto shrink-0 no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 md:gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                                        activeTab === tab.id
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4 shrink-0" />
                                    {tab.label}
                                </button>
                            );
                        })}

                        <div className="hidden md:block mt-auto pt-4 border-t">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                            >
                                <LogOut className="h-4 w-4" />
                                Log out
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
                        <div className="p-4 md:p-6 pb-2 md:pb-4 border-b sticky top-0 bg-background/95 backdrop-blur z-10 flex items-center justify-between">
                            <h2 className="text-lg font-semibold capitalize">
                                {tabs.find((t) => t.id === activeTab)?.label}
                            </h2>
                            <Button variant="ghost" size="icon" className="md:hidden text-destructive" onClick={handleLogout}>
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="p-4 md:p-6 space-y-6 md:space-y-8 pb-20 md:pb-6">
                            {activeTab === "general" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <Label className="text-sm font-medium">Appearance</Label>
                                        <Select value={theme} onValueChange={(val) => val && setTheme(val)}>
                                            <SelectTrigger className="w-full md:w-48 h-9 bg-secondary/50 border-0 ring-1 ring-white/10 focus:ring-primary">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="system">System</SelectItem>
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="dark">Dark</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <Label className="text-sm font-medium">Language</Label>
                                        <Select defaultValue="auto">
                                            <SelectTrigger className="w-full md:w-48 h-9 bg-secondary/50 border-0 ring-1 ring-white/10 focus:ring-primary">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="auto">Auto-detect</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium">Spoken language</Label>
                                            <p className="text-xs md:text-sm text-muted-foreground w-full md:pr-8">
                                                For best results, select the language you mainly speak.
                                            </p>
                                        </div>
                                        <Select defaultValue="auto">
                                            <SelectTrigger className="w-full md:w-48 h-9 bg-secondary/50 border-0 ring-1 ring-white/10 focus:ring-primary">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="auto">Auto-detect</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium">Interviewer Voice</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Choose the voice for your AI interviewer. Click Play to preview.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none h-9" onClick={handlePlayVoice}>
                                                <Play className={cn("h-4 w-4 fill-current", isPlayingVoice && "text-primary animate-pulse")} />
                                                {isPlayingVoice ? "Playing..." : "Play"}
                                            </Button>
                                            <Select value={selectedVoice} onValueChange={handleVoiceChange}>
                                                <SelectTrigger className="w-full md:w-64 h-9 bg-secondary/50 border-0 ring-1 ring-white/10 focus:ring-primary">
                                                    <SelectValue>
                                                        {VOICES.find(v => v.id === selectedVoice)?.name}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {VOICES.map(v => (
                                                        <SelectItem key={v.id} value={v.id}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{v.name}</span>
                                                                <span className="text-xs text-muted-foreground">{v.description}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label className="text-sm font-medium">Separate voice mode</Label>
                                            <p className="text-xs md:text-sm text-muted-foreground pr-8">
                                                Keep Voice in a separate full screen layout.
                                            </p>
                                        </div>
                                        <Switch />
                                    </div>
                                </div>
                            )}

                            {activeTab === "data_controls" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Improve the model for everyone</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">On</span>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Shared links</Label>
                                        <Button variant="outline" size="sm" className="h-8">Manage</Button>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">History</Label>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="h-8" onClick={handleExportHistory}>Export</Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" className="h-8">Delete</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete History?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete your interview history and scores.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "account" && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
                                        <Avatar className="h-20 w-20 border-2 border-primary/20">
                                            <AvatarImage src={user.image || ""} alt={user.name} />
                                            <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                                                {user.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <div className="font-semibold text-xl">{user.name}</div>
                                            <div className="text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-medium">Email address</Label>
                                            <div className="flex">
                                                <Input value={user.email} disabled className="h-9 bg-secondary/30 border-0 ring-1 ring-white/10 text-muted-foreground font-medium opacity-100" />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label className="text-sm font-medium">Phone number</Label>
                                            <Input placeholder="None added" className="h-9 bg-secondary/50 border-0 ring-1 ring-white/10 focus-visible:ring-primary focus-visible:ring-1" />
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Subscription</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs md:text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">Free Plan</span>
                                            <Button variant="outline" size="sm" className="h-8">Upgrade</Button>
                                        </div>
                                    </div>

                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-destructive">Delete account</Label>
                                        <Button variant="destructive" size="sm" className="h-8">Delete</Button>
                                    </div>

                                    <Separator />
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium">Log out of your account</Label>
                                        <Button variant="outline" onClick={handleLogout} className="h-8">
                                            Sign out
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {!["general", "data_controls", "account"].includes(activeTab) && (
                                <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                                    <Settings className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Settings for {tabs.find((t) => t.id === activeTab)?.label} will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
