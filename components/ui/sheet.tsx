"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"

function Sheet({ ...props }: DialogPrimitive.Root.Props) {
    return <DialogPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
    return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetPortal({ ...props }: DialogPrimitive.Portal.Props) {
    return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetClose({ ...props }: DialogPrimitive.Close.Props) {
    return <DialogPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetOverlay({
    className,
    ...props
}: DialogPrimitive.Backdrop.Props) {
    return (
        <DialogPrimitive.Backdrop
            data-slot="sheet-overlay"
            className={cn("data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/40 duration-300 fixed inset-0 isolate z-50 backdrop-blur-sm", className)}
            {...props}
        />
    )
}

function SheetContent({
    className,
    children,
    side = "left",
    showCloseButton = true,
    ...props
}: DialogPrimitive.Popup.Props & {
    side?: "left" | "right" | "top" | "bottom"
    showCloseButton?: boolean
}) {
    const sideClasses = {
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-closed:slide-out-to-left data-open:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4 border-l data-closed:slide-out-to-right data-open:slide-in-from-right sm:max-w-sm",
        top: "inset-x-0 top-0 border-b data-closed:slide-out-to-top data-open:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-closed:slide-out-to-bottom data-open:slide-in-from-bottom",
    }

    return (
        <SheetPortal>
            <SheetOverlay />
            <DialogPrimitive.Popup
                data-slot="sheet-content"
                className={cn(
                    "bg-background data-open:animate-in data-closed:animate-out duration-300 fixed z-50 gap-4 p-6 shadow-lg outline-none transition ease-in-out",
                    sideClasses[side],
                    className
                )}
                {...props}
            >
                {children}
                {showCloseButton && (
                    <DialogPrimitive.Close
                        data-slot="sheet-close"
                        render={
                            <Button
                                variant="ghost"
                                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                                size="icon-sm"
                            >
                                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
                                <span className="sr-only">Close</span>
                            </Button>
                        }
                    />
                )}
            </DialogPrimitive.Popup>
        </SheetPortal>
    )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sheet-header"
            className={cn("flex flex-col gap-2", className)}
            {...props}
        />
    )
}

function SheetFooter({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="sheet-footer"
            className={cn(
                "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
                className
            )}
            {...props}
        />
    )
}

function SheetTitle({ className, ...props }: DialogPrimitive.Title.Props) {
    return (
        <DialogPrimitive.Title
            data-slot="sheet-title"
            className={cn("text-lg font-semibold text-foreground", className)}
            {...props}
        />
    )
}

function SheetDescription({
    className,
    ...props
}: DialogPrimitive.Description.Props) {
    return (
        <DialogPrimitive.Description
            data-slot="sheet-description"
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    )
}

export {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
