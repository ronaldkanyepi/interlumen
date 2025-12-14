"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import React from "react"

export const InfiniteSlider = ({
    children,
    gap = 20,
    speed = 100,
    speedOnHover,
    direction = "left",
    className,
}: {
    children: React.ReactNode
    gap?: number
    speed?: number
    speedOnHover?: number
    direction?: "left" | "right"
    className?: string
}) => {
    return (
        <div className={cn("overflow-hidden", className)}>
            <motion.div
                className="flex w-max"
                style={{ gap: `${gap}px` }}
                animate={{
                    x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
                }}
                transition={{
                    duration: speed,
                    repeat: Infinity,
                    ease: "linear",
                }}
                whileHover={speedOnHover ? { transition: { duration: speedOnHover } } : undefined}
            >
                {children}
                {children}
                {children}
            </motion.div>
        </div>
    )
}
