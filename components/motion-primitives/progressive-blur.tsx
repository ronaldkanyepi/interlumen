import { cn } from "@/lib/utils"

export const ProgressiveBlur = ({
    direction = "bottom",
    blurIntensity = 1,
    className,
}: {
    direction?: "top" | "bottom" | "left" | "right"
    blurIntensity?: number
    className?: string
}) => {
    const gradientStyle = React.useMemo(() => {
        // simplified linear gradient emulation for progressive blur
        const stops = [
            "rgba(0,0,0,1) 0%",
            "rgba(0,0,0,0) 100%"
        ]
        const angle = {
            top: "to bottom",
            bottom: "to top",
            left: "to right",
            right: "to left",
        }[direction]

        return {
            maskImage: `linear-gradient(${angle}, ${stops.join(", ")})`,
            WebkitMaskImage: `linear-gradient(${angle}, ${stops.join(", ")})`,
            backdropFilter: `blur(${8 * blurIntensity}px)`
        }

    }, [direction, blurIntensity])


    return (
        <div className={cn("absolute z-10", className)} style={gradientStyle}></div>
    )
}
import React from 'react'
