import { Button, buttonVariants } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function EcosystemSection() {
    return (
        <section className="py-16 md:py-32 bg-background">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
                <div className="overflow-hidden rounded-2xl border bg-muted shadow-sm group">
                    <img
                        className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                        src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop"
                        alt="Candidate success"
                        loading="lazy"
                    />
                </div>

                <div className="grid gap-6 md:grid-cols-2 md:gap-12 text-left items-center">
                    <h2 className="text-3xl font-semibold tracking-tight md:text-4xl text-balance">The complete ecosystem for your interview success.</h2>
                    <div className="space-y-8">
                        <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
                            Interlume brings together advanced AI models, real-time analytics, and personalized coaching in one platform. We don't just give you questions; we provide the entire infrastructure you need to master behavioral and technical rounds.
                        </p>

                        <Link
                            href="/auth/register"
                            className={cn(buttonVariants(), "group h-12 rounded-full bg-[#ff2d55] hover:bg-[#ff2d55]/90 px-8 text-white shadow-lg shadow-[#ff2d55]/40 hover:shadow-[#ff2d55]/60 transition-all duration-300 hover:-translate-y-0.5 w-fit flex items-center")}
                        >
                            <span className="font-semibold text-base">Start Your Journey</span>
                            <ChevronRight className="ml-2 size-5 stroke-[3] transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
