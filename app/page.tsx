"use client"
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, Star, Code, LineChart, Zap, FileText, CheckCircle, Mouse, Mail, SendHorizonal, Linkedin, Github } from "lucide-react";
import { HeroHeader } from "@/components/hero-header";
import { IntegrationsSection } from "@/components/integrations-section";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { LogoCloud } from "@/components/logo-cloud";
import { InterviewStats } from "@/components/interview-stats";
import { EcosystemSection } from "@/components/ecosystem-section";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <HeroHeader />

            <main className="flex-1">
                <section>
                    <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-32 lg:pt-48">
                        <div className="relative z-10 mx-auto max-w-4xl text-center">
                            <h1 className="text-balance text-4xl font-bold md:text-5xl lg:text-6xl tracking-tight flex flex-wrap justify-center gap-x-3 md:gap-x-4">
                                <TextEffect as="span" preset="fade-in-blur" speedSegment={0.3}>
                                    Shine Bright in Every Interview with
                                </TextEffect>
                                <motion.span
                                    initial={{ opacity: 0, filter: 'blur(12px)', y: 20 }}
                                    animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                                    transition={{ delay: 1.0, duration: 0.8 }}
                                    className="inline-block"
                                >
                                    <span className="text-primary">Inter</span>lume
                                </motion.span>
                            </h1>
                            <TextEffect
                                per="line"
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                delay={0.5}
                                as="p"
                                className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
                                Your personal AI-powered guide to interview success. Practice, learn, and gain confidence all in one app.
                            </TextEffect>

                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 0.75,
                                            },
                                        },
                                    },
                                    item: {
                                        hidden: {
                                            opacity: 0,
                                            filter: 'blur(12px)',
                                            y: 12,
                                        },
                                        visible: {
                                            opacity: 1,
                                            filter: 'blur(0px)',
                                            y: 0,
                                            transition: {
                                                type: 'spring',
                                                bounce: 0.3,
                                                duration: 1.5,
                                            },
                                        },
                                    },
                                }}
                                className="mt-6">
                                <div className="flex flex-col gap-3 sm:flex-row items-center justify-center">
                                    <Link href="/auth/register">
                                        <Button className="h-10 px-6 text-sm rounded-full">Get Started</Button>
                                    </Link>
                                    <Link href="#features">
                                        <Button variant="outline" className="h-10 px-6 text-sm rounded-full">Learn More</Button>
                                    </Link>
                                </div>
                                <div className="mt-3 text-sm text-muted-foreground mb-4">
                                    Free of charge
                                </div>

                                <div
                                    aria-hidden
                                    className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 dark:from-emerald-500/10 relative mx-auto mt-32 max-w-2xl to-transparent to-55% text-left">
                                    <div className="bg-background border-border/50 absolute inset-0 mx-auto w-80 -translate-x-3 -translate-y-12 rounded-[2rem] border p-2 [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:-translate-x-6">
                                        <div className="relative h-96 overflow-hidden rounded-[1.5rem] border p-2 pb-12 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] before:opacity-50"></div>
                                    </div>
                                    <div className="bg-muted dark:bg-background/50 border-border/50 mx-auto w-80 translate-x-4 rounded-[2rem] border p-2 backdrop-blur-3xl [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:translate-x-8">
                                        <div className="bg-background space-y-2 overflow-hidden rounded-[1.5rem] border p-2 shadow-xl dark:bg-white/5 dark:shadow-black dark:backdrop-blur-3xl">
                                            <InterviewStats />

                                            <div className="bg-muted rounded-[1rem] p-4 pb-16 dark:bg-white/5"></div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mix-blend-overlay [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:opacity-5"></div>
                                </div>
                            </AnimatedGroup>
                        </div>
                    </div>
                </section>
                <LogoCloud />

                {/* Ecosystem Section */}
                <EcosystemSection />

                {/* Features Section */}
                <section id="features" className="py-12 md:py-20 bg-muted/30">
                    <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Master Your Interview Skills</h2>
                            <p className="text-muted-foreground text-lg">Comprehensive tools to help you land your dream job, tailored to your needs.</p>
                        </div>

                        <div className="relative mx-auto grid max-w-4xl divide-x divide-y border bg-background sm:grid-cols-2 lg:grid-cols-3 rounded-xl overflow-hidden shadow-sm">
                            {/* Feature 1 */}
                            <div className="space-y-2 p-8">
                                <div className="flex items-center gap-2">
                                    <Mic className="size-4 text-primary" />
                                    <h3 className="text-sm font-medium">AI Mock Interviews</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Simulate real interviews and receive instant, actionable feedback.</p>
                            </div>
                            {/* Feature 2 */}
                            <div className="space-y-2 p-8">
                                <div className="flex items-center gap-2">
                                    <Star className="size-4 text-primary" />
                                    <h3 className="text-sm font-medium">Behavioral Mastery</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Learn the STAR method and answer confidently with guidance.</p>
                            </div>
                            {/* Feature 3 */}
                            <div className="space-y-2 p-8">
                                <div className="flex items-center gap-2">
                                    <Code className="size-4 text-primary" />
                                    <h3 className="text-sm font-medium">Technical Prep</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Tailored practice questions to match your target role and industry.</p>
                            </div>
                            {/* Feature 4 */}
                            <div className="space-y-2 p-8">
                                <div className="flex items-center gap-2">
                                    <LineChart className="size-4 text-primary" />
                                    <h3 className="text-sm font-medium">Personalized Insights</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Track your progress, identify strengths, and illuminate areas to improve.</p>
                            </div>
                            {/* Feature 5 */}
                            <div className="space-y-2 p-8">
                                <div className="flex items-center gap-2">
                                    <Zap className="size-4 text-primary" />
                                    <h3 className="text-sm font-medium">Instant Feedback</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Get real-time feedback on your pacing, tone, and filler words.</p>
                            </div>
                            {/* Feature 6 */}
                            <div className="space-y-2 p-8">
                                <div className="flex items-center gap-2">
                                    <FileText className="size-4 text-primary" />
                                    <h3 className="text-sm font-medium">Resume Analysis</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">Optimize your resume with AI suggestions to pass ATS scanners.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Integrations Section */}
                <IntegrationsSection />

                {/* Testimonials Section */}
                <section id="testimonials" className="py-16 md:py-32">
                    <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
                        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                            <h2 className="text-balance text-4xl font-bold lg:text-5xl">Built by engineers, trusted by candidates</h2>
                            <p className="text-lg text-muted-foreground">Interlume is helping thousands of candidates land their dream roles at top tech companies.</p>
                        </div>

                        <div className="grid gap-4 [--color-card:var(--color-muted)] sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2 dark:[--color-muted:var(--color-zinc-900)]">
                            <Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2 bg-muted/30 border-none shadow-sm">
                                <CardHeader>
                                    <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center text-primary">
                                        <CheckCircle className="h-5 w-5" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                        <p className="text-xl font-medium">Interlume completely changed how I prepare. The technical questions were incredibly accurate to what I faced in my actual Google interview. The feedback on my code explanation was the missing piece I needed.</p>

                                        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                            <Avatar className="size-12">
                                                <AvatarImage
                                                    src="https://randomuser.me/api/portraits/women/44.jpg"
                                                    alt="Sophia Chen"
                                                    loading="lazy"
                                                />
                                                <AvatarFallback>SC</AvatarFallback>
                                            </Avatar>

                                            <div>
                                                <cite className="text-sm font-medium not-italic">Sophia Chen</cite>
                                                <span className="text-muted-foreground block text-sm">Software Engineer at Google</span>
                                            </div>
                                        </div>
                                    </blockquote>
                                </CardContent>
                            </Card>
                            <Card className="md:col-span-2 bg-muted/30 border-none shadow-sm">
                                <CardContent className="h-full pt-6">
                                    <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                        <p className="text-xl font-medium">Simple, effective, and straight to the point. Interlume helped me refine my behavioral stories using the STAR method perfectly.</p>

                                        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                            <Avatar className="size-12">
                                                <AvatarImage
                                                    src="https://randomuser.me/api/portraits/men/32.jpg"
                                                    alt="Marcus Johnson"
                                                    loading="lazy"
                                                />
                                                <AvatarFallback>MJ</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <cite className="text-sm font-medium not-italic">Marcus Johnson</cite>
                                                <span className="text-muted-foreground block text-sm">Product Manager at Spotify</span>
                                            </div>
                                        </div>
                                    </blockquote>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/30 border-none shadow-sm">
                                <CardContent className="h-full pt-6">
                                    <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                        <p>The mock interviews felt surprisingly real. It killed my anxiety before the big day.</p>

                                        <div className="grid items-center gap-3 [grid-template-columns:auto_1fr]">
                                            <Avatar className="size-12">
                                                <AvatarImage
                                                    src="https://randomuser.me/api/portraits/women/68.jpg"
                                                    alt="Emily Davis"
                                                    loading="lazy"
                                                />
                                                <AvatarFallback>ED</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <cite className="text-sm font-medium not-italic">Emily Davis</cite>
                                                <span className="text-muted-foreground block text-sm">Frontend Dev</span>
                                            </div>
                                        </div>
                                    </blockquote>
                                </CardContent>
                            </Card>
                            <Card className="bg-muted/30 border-none shadow-sm">
                                <CardContent className="h-full pt-6">
                                    <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                        <p>I love the progress tracking. Watching my score improve gave me so much confidence.</p>

                                        <div className="grid grid-cols-[auto_1fr] gap-3">
                                            <Avatar className="size-12">
                                                <AvatarImage
                                                    src="https://randomuser.me/api/portraits/men/86.jpg"
                                                    alt="Alex Rivera"
                                                    loading="lazy"
                                                />
                                                <AvatarFallback>AR</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-medium">Alex Rivera</p>
                                                <span className="text-muted-foreground block text-sm">Data Scientist</span>
                                            </div>
                                        </div>
                                    </blockquote>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                    <div className="container mx-auto px-4 text-center sm:px-8 relative z-10">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Ready to Ace Your Next Interview?</h2>
                        <p className="max-w-2xl mx-auto text-lg text-primary-foreground/80 mb-10">
                            Join Interlume today and start your journey to career success with AI-powered preparation.
                        </p>
                        <Link href="/register">
                            <Button size="lg" variant="secondary" className="text-lg h-12 px-8 font-semibold">
                                Get Interview Ready Today
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="py-6 md:px-8 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                    <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Created by <span className="font-medium text-foreground">Ronald Kanyepi</span>
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="https://linkedin.com/in/ronaldkanyepi" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Linkedin className="size-5" />
                        </Link>
                        <Link href="https://github.com/ronaldkanyepi" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Github className="size-5" />
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}