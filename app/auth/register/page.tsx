"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signUpAction } from "@/lib/actions/auth";
import { authClient } from "@/lib/auth/client";

export default function RegisterPage() {
    const [error, setError] = useState("");
    const [isPending, startTransition] = useTransition();
    const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setError("");

        const firstName = formData.get("firstName")?.toString() || "";
        const lastName = formData.get("lastName")?.toString() || "";
        const name = `${firstName} ${lastName}`.trim();
        formData.append("name", name);

        const password = formData.get("password")?.toString() || "";
        const confirmPassword = formData.get("confirmPassword")?.toString() || "";

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        startTransition(async () => {
            const result = await signUpAction(formData);
            if (result && "error" in result) {
                setError(result.error);
            }
        });
    };

    const handleSocialLogin = async (provider: "google" | "github") => {
        setIsSocialLoading(provider);
        setError("");
        try {
            await authClient.signIn.social({
                provider,
                callbackURL: "/home",
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to sign in with " + provider);
            setIsSocialLoading(null);
        }
    };

    return (
        <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8 md:py-12 dark:bg-transparent">
            <form
                action={handleSubmit}
                className="bg-card mx-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Join <span className="text-primary">Inter</span>lume</h1>
                        <p className="text-sm text-muted-foreground">Enter your information immediately to get started</p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => handleSocialLogin("google")}
                            disabled={isSocialLoading !== null}
                        >
                            {isSocialLoading === "google" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    <span>Google</span>
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => handleSocialLogin("github")}
                            disabled={isSocialLoading !== null}
                        >
                            {isSocialLoading === "github" ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Github className="mr-2 h-4 w-4" />
                                    <span>Github</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <hr className="my-4 border-dashed" />

                    <div className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first-name">First name</Label>
                                <Input id="first-name" name="firstName" placeholder="John" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="last-name">Last name</Label>
                                <Input id="last-name" name="lastName" placeholder="Doe" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input id="confirmPassword" name="confirmPassword" type="password" required />
                        </div>

                        <Button className="w-full mt-2" type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create account"
                            )}
                        </Button>
                    </div>
                </div>

                <div className="bg-muted rounded-b-[calc(var(--radius)+.125rem)] border-t p-3">
                    <p className="text-muted-foreground text-center text-sm">
                        Already have an account?
                        <Link
                            href="/auth/login"
                            className={cn(buttonVariants({ variant: "link" }), "px-2 font-semibold")}
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </form>
        </section>
    );
}
