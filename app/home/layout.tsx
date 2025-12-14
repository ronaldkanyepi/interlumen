
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Mic, History, Settings, LogOut, User } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-muted/40 text-foreground">
            {/* Sidebar */}
            <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
                <div className="flex h-14 items-center border-b px-6">
                    <Link href="/" className="flex items-center font-bold text-xl tracking-tighter">
                        <span className="text-primary">Inter</span>lume
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="grid gap-1 px-2 text-sm font-medium">
                        <Link href="/home" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-all hover:text-primary">
                            <LayoutDashboard className="h-4 w-4" />
                            Overview
                        </Link>
                        <Link href="/home/practice" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                            <Mic className="h-4 w-4" />
                            Practice
                        </Link>
                        <Link href="/home/history" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                            <History className="h-4 w-4" />
                            History
                        </Link>
                        <Link href="/home/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                    </nav>
                </div>
                <div className="border-t p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="grid gap-0.5 text-xs">
                            <div className="font-semibold">Ronald Kanyepi</div>
                            <div className="text-muted-foreground">ronald@example.com</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                    <div className="w-full flex-1">
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                    </div>
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    </Link>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
                    {children}
                </main>
            </div>
        </div>
    );
}
