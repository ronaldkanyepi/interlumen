"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { UserProfileNav } from "@/components/user-profile-nav";

interface MobileSidebarProps {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
}

export function MobileSidebar({ user }: MobileSidebarProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar when route changes
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={
                <Button variant="ghost" size="icon" className="lg:hidden mr-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            } />
            <SheetContent side="left" className="p-0 flex flex-col gap-0 w-[80%] sm:max-w-xs">
                <div className="flex h-14 items-center border-b px-6">
                    <Link href="/" className="flex items-center font-bold text-xl tracking-tighter">
                        <span className="text-primary">Inter</span>lume
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <DashboardSidebar user={user} />
                </div>
                <div className="border-t p-4">
                    <UserProfileNav user={user} />
                </div>
            </SheetContent>
        </Sheet>
    );
}
