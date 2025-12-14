export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/40">
            <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard...</p>
            </div>
        </div>
    );
}
