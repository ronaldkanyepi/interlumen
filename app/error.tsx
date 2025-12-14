"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
  }, [error]);

  return (
    <section className="pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 lg:pb-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px]">
          <div className="text-center space-y-8 sm:space-y-10 md:space-y-12 max-w-2xl mx-auto">
            <div className="relative flex flex-row items-center justify-center gap-2 sm:gap-4 font-bold text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] text-primary leading-none select-none">
              <span>500</span>
            </div>

            <div className="space-y-4 sm:space-y-5">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-tight">
                Something went wrong
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                We encountered an unexpected error. Our team has been notified
                and is working on a fix.
              </p>
              {process.env.NODE_ENV === "development" && error.message && (
                <div className="mt-6 p-4 sm:p-5 bg-muted/50 rounded-lg border border-border text-left">
                  <p className="text-xs font-mono text-foreground break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                onClick={reset}
                variant="outline"
                className="h-12 rounded-full border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-300 group"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="font-medium">Try Again</span>
                </span>
              </Button>
              <Link
                href="/"
                className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-full border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-300 group flex items-center gap-2")}
              >
                <Home className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span className="font-medium">Go Home</span>
              </Link>
            </div>

            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">
                Or visit these pages:
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link
                  href="/"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Home
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/auth/login"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </Link>
                <span className="text-muted-foreground">•</span>
                <Link
                  href="/auth/signup"
                  className="text-foreground hover:text-primary transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

