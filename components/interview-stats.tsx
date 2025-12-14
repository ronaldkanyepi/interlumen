import React from 'react'
import { CheckCircle2, TrendingUp } from 'lucide-react'

export const InterviewStats = () => {
    return (
        <div className="relative space-y-3 rounded-[1rem] bg-white/5 p-4">
            <div className="flex items-center gap-1.5 text-orange-400">
                <TrendingUp className="h-5 w-5" />
                <div className="text-sm font-medium">Readiness</div>
            </div>

            <div className="space-y-3">
                <div className="text-foreground border-b border-white/10 pb-3 text-sm font-medium">
                    You're fully prepared for your upcoming Google interview.
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <div className="space-x-1">
                            <span className="text-foreground align-baseline text-xl font-medium">94</span>
                            <span className="text-muted-foreground text-xs">/100 Score</span>
                        </div>
                        <div className="flex h-5 items-center rounded bg-gradient-to-l from-emerald-400 to-indigo-600 px-2 text-xs text-white w-full">
                            Technical
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="space-x-1">
                            <span className="text-foreground align-baseline text-xl font-medium">88</span>
                            <span className="text-muted-foreground text-xs">/100 Score</span>
                        </div>
                        <div className="text-foreground bg-muted flex h-5 w-2/3 items-center rounded px-2 text-xs dark:bg-white/20">
                            Behavioral
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
