import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { HeroHeader } from "@/components/hero-header";
import { getSession } from "@/lib/auth/server";
import { Github, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function NotFound() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <HeroHeader />
      <section className="flex-1 pt-16 md:pt-24 lg:pt-32 pb-12 md:pb-16 lg:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-[400px] sm:min-h-[500px]">
            <div className="text-center space-y-8 sm:space-y-10 md:space-y-12 max-w-2xl mx-auto">
              <div className="relative flex flex-row items-center justify-center gap-2 sm:gap-4 font-bold text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] text-primary leading-none select-none">
                <span>404</span>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground tracking-tight leading-tight">
                  Page Not Found
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  The page you&apos;re looking for doesn&apos;t exist or has been
                  moved. Let&apos;s get you back on track.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link
                  href="/"
                  className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-full border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-300 group flex items-center gap-2")}
                >
                  <Home className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="font-medium">Go Home</span>
                </Link>
                <Link
                  href="/auth/login"
                  className={cn(buttonVariants({ variant: "outline" }), "h-12 rounded-full border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-8 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-300 group flex items-center gap-2")}
                >
                  <ArrowLeft className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="font-medium">Sign In</span>
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
      <footer className="flex-shrink-0 relative z-50 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-3 sm:px-4 md:px-6 py-2.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground flex-1">
              <span>© {new Date().getFullYear()} InsightBox</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm">SQL-powered data analysis with DuckDB</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

