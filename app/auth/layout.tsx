
import Link from "next/link";


export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 sm:px-8">
            <Link
                href="/"
                className="absolute left-4 top-4 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary sm:left-8 sm:top-8"
            >
                <span className="text-xl">←</span> Back to Home
            </Link>
            <div className="w-full max-w-md space-y-8">
                <div className="flex justify-center">
                    <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
                        <span className="text-primary">Inter</span> lume
                    </Link>
                </div>
                {children}
            </div>
        </div>
    );
}
