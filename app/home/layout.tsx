
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { UserProfileNav } from "@/components/user-profile-nav";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/auth/login");
    }

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
                    <DashboardSidebar user={session.user} />
                </div>
                <div className="border-t p-4">
                    <UserProfileNav user={session.user} />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                    <div className="w-full flex-1">
                        <h1 className="text-lg font-semibold">Dashboard</h1>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/20">
                    {children}
                </main>
            </div>
        </div>
    );
}
