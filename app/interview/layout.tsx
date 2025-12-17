export default function InterviewLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Simple Header */}
            <header className="h-14 border-b flex items-center px-6">
                <div className="font-bold text-xl tracking-tighter">
                    <span className="text-primary">Inter</span>lume
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
