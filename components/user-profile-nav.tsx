
"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, Shield, Bell, Database, ChevronRight, Play, LogOut, Menu } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UserProfileNavProps {
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

export function UserProfileNav({ user }: UserProfileNavProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("general");
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-muted/50 outline-none group focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        <Avatar className="h-8 w-8 border border-primary/20 transition-all group-hover:border-primary/50">
                            <AvatarImage src={user.image || ""} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 gap-0.5 text-xs">
                            <div className="font-semibold text-primary">{user.name}</div>
                            <div className="text-muted-foreground truncate group-hover:text-foreground transition-colors">{user.email}</div>
                        </div>
                        <Settings className="ml-auto h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start" side="top" sideOffset={8}>
                    <div className="px-2 py-1.5 text-sm font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsModalOpen(true)} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
                                        <Select defaultValue="system">
                                            <SelectTrigger className="w-full md:w-48 h-9 bg-secondary/50 border-0 ring-1 ring-white/10 focus:ring-primary">
                                                <SelectValue placeholder="System" />
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
                                        <Label className="text-sm font-medium">Accent color</Label>
                                        <Select defaultValue="default">
                                            <SelectTrigger className="w-full md:w-48 h-9 bg-secondary/50 border-0 ring-1 ring-white/10 focus:ring-primary">
                                                <SelectValue placeholder="Rose (Default)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">Rose (Default)</SelectItem>
                                                <SelectItem value="blue">Blue</SelectItem>
                                                <SelectItem value="green">Green</SelectItem>
                                                <SelectItem value="orange">Orange</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <Label className="text-sm font-medium">Language</Label>
                                        <Select defaultValue="auto">
                                            <SelectTrigger className="w-full md:w-48 h-9 bg-secondary/50 border-0 ring-1 ring-white/10 focus:ring-primary">
                                                <SelectValue placeholder="Auto-detect" />
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
                                                <SelectValue placeholder="Auto-detect" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="auto">Auto-detect</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <Label className="text-sm font-medium">Voice</Label>
                                        <div className="flex items-center gap-2 w-full md:w-auto">
                                            <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none h-9">
                                                <Play className="h-4 w-4 fill-current" />
                                                Play
                                            </Button>
                                            <Select defaultValue="cove">
                                                <SelectTrigger className="w-32 flex-1 md:flex-none h-9 bg-secondary/50 border-0 ring-1 ring-white/10 focus:ring-primary">
                                                    <SelectValue placeholder="Cove" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="cove">Cove</SelectItem>
                                                    <SelectItem value="juniper">Juniper</SelectItem>
                                                    <SelectItem value="sky">Sky</SelectItem>
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
                                            <Button variant="outline" size="sm" className="h-8">Export</Button>
                                            <Button variant="destructive" size="sm" className="h-8">Delete</Button>
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
