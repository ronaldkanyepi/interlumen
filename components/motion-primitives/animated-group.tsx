"use client"
import { motion, MotionProps, Variants } from "framer-motion"
import React, { ReactNode } from "react"

type AnimatedGroupProps = {
    children: ReactNode
    className?: string
    variants?: {
        container?: Variants
        item?: Variants
    }
    preset?: "blur" | "fade-in-blur" | "scale" | "fade" | "slide"
} & MotionProps

const defaultVariants = {
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    },
    item: {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    },
}

export const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
    children,
    className,
    variants,
    preset,
    ...props
}) => {
    const containerVariants = variants?.container || defaultVariants.container
    const itemVariants = variants?.item || defaultVariants.item

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={className}
            {...props}
        >
            {React.Children.map(children, (child) => (
                <motion.div variants={itemVariants}>{child}</motion.div>
            ))}
        </motion.div>
    )
}
