"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Mic, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
    onOpenSettings?: () => void;
}

const navItems = [
    {
        title: "Overview",
        href: "/home",
        icon: LayoutDashboard,
    },
    {
        title: "Practice",
        href: "/interview/setup",
        icon: Mic,
    },
    {
        title: "History",
        href: "/home/history",
        icon: History,
    },
];

export function DashboardNav({ onOpenSettings }: DashboardNavProps) {
    const pathname = usePathname();

    return (
        <nav className="grid gap-1 px-2 text-sm font-medium">
            {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                    <Link
                        key={index}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 rounded-r-lg px-3 py-2 transition-all hover:text-primary border-l-4",
                            pathname === item.href
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {item.title}
                    </Link>
                );
            })}

            {/* Settings Button - opens modal */}
            <button
                onClick={onOpenSettings}
                className={cn(
                    "flex items-center gap-3 rounded-r-lg px-3 py-2 transition-all hover:text-primary border-l-4",
                    "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground text-left"
                )}
            >
                <Settings className="h-4 w-4" />
                Settings
            </button>
        </nav>
    );
}
