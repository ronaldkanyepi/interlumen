"use client"
import { motion, MotionProps, Variants } from "framer-motion"
import React from "react"

type TextEffectProps = {
    children: string
    per?: "word" | "char" | "line"
    as?: keyof React.JSX.IntrinsicElements
    variants?: {
        container?: Variants
        item?: Variants
    }
    className?: string
    preset?: "blur" | "fade-in-blur" | "scale" | "fade" | "slide"
    delay?: number
    speedSegment?: number
} & MotionProps

const defaultVariants = {
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    },
    item: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 0.5 },
        },
    },
}

const presets = {
    blur: {
        container: defaultVariants.container,
        item: {
            hidden: { opacity: 0, filter: "blur(12px)" },
            visible: { opacity: 1, filter: "blur(0px)" },
        },
    },
    "fade-in-blur": {
        container: defaultVariants.container,
        item: {
            hidden: { opacity: 0, y: 20, filter: "blur(12px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" },
        },
    },
    scale: {
        container: defaultVariants.container,
        item: {
            hidden: { opacity: 0, scale: 0 },
            visible: { opacity: 1, scale: 1 },
        },
    },
    fade: {
        container: defaultVariants.container,
        item: {
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
        },
    },
    slide: {
        container: defaultVariants.container,
        item: {
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
        },
    },
}

const AnimationComponent: React.FC<TextEffectProps> = ({
    children,
    per = "word",
    as = "div",
    variants,
    className,
    preset,
    delay = 0,
    speedSegment = 0.05,
    ...props
}) => {
    const MotionTag = motion[as as keyof typeof motion] as any
    const selectedVariants = preset ? presets[preset] : { container: defaultVariants.container, item: defaultVariants.item }
    const containerVariants = variants?.container || selectedVariants.container
    const itemVariants = variants?.item || selectedVariants.item

    let finalContainerVariants = containerVariants
    if (delay) {
        const visibleVariant = containerVariants.visible as any
        if (visibleVariant) {
            finalContainerVariants = {
                ...containerVariants,
                visible: {
                    ...visibleVariant,
                    transition: {
                        ...visibleVariant.transition,
                        delayChildren: delay,
                    }
                }
            }
        }
    }

    // Logic to split content based on 'per' prop
    let content: React.ReactNode[] = []

    if (per === 'word') {
        const words = children.split(" ")
        content = words.map((word, index) => (
            <React.Fragment key={index}>
                <motion.span variants={itemVariants} style={{ display: "inline-block" }}>
                    {word}
                </motion.span>
                {index < words.length - 1 && " "}
            </React.Fragment>
        ))
    } else if (per === 'char') {
        const chars = children.split("")
        content = chars.map((char, index) => (
            <motion.span key={index} variants={itemVariants} style={{ display: "inline-block" }}>
                {char === " " ? "\u00A0" : char}
            </motion.span>
        ))
    } else if (per === 'line') {
        // Fallback for line: treat as words but maybe we could assume lines if explicitly passed, but for now robust word splitting is better than broken text
        // Ideally we would split by \n if the text was formatted, but here it's likely just wrapping text.
        // We will default to word splitting for layout safety, but maybe wrap them differently?
        // For safety against the user's issue, we'll use same logic as 'word' but maybe wrapping isn't needed if it's just <p>.
        const words = children.split(" ")
        content = words.map((word, index) => (
            <React.Fragment key={index}>
                <motion.span variants={itemVariants} style={{ display: "inline-block" }}>
                    {word}
                </motion.span>
                {index < words.length - 1 && " "}
            </React.Fragment>
        ))
    }

    return (
        <MotionTag
            variants={finalContainerVariants}
            initial="hidden"
            animate="visible"
            className={className}
            {...props}
        >
            {content}
        </MotionTag>
    )
}

export const TextEffect = AnimationComponent
