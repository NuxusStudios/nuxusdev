"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TicketButtonProps extends React.ComponentProps<"button"> {
  /** Text printed on the torn-off stub. */
  stub?: string
  /** Distance of the perforation from the right edge. */
  stubWidth?: string
}

/**
 * A call to action shaped like a ticket stub rather than a rounded rectangle.
 *
 * The notches are cut, not drawn. Two radial gradients are composited into a
 * mask that removes a semicircle from the top and bottom edges at the
 * perforation, so the bite is taken out of the element itself — it stays a hole
 * whatever sits behind the button. Painting circles in the page colour instead
 * only works until the background stops being flat.
 *
 * Everything hangs off one custom property for the tear position, so the mask,
 * the dashed line and the stub can never drift apart.
 */
export function TicketButton({
  children,
  stub = "ADMIT",
  stubWidth = "5.25rem",
  className,
  disabled,
  ...props
}: TicketButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{ ["--tear" as string]: `calc(100% - ${stubWidth})` }}
      className={cn(
        "group relative inline-flex items-stretch overflow-hidden text-left",
        "bg-primary text-primary-foreground",
        "rounded-[0.45rem]",
        // The bite: a semicircle removed from each edge at the tear line.
        "[-webkit-mask-composite:source-in] [mask-composite:intersect]",
        "[-webkit-mask-image:radial-gradient(circle_7px_at_var(--tear)_0%,transparent_97%,#000_100%),radial-gradient(circle_7px_at_var(--tear)_100%,transparent_97%,#000_100%)]",
        "[mask-image:radial-gradient(circle_7px_at_var(--tear)_0%,transparent_97%,#000_100%),radial-gradient(circle_7px_at_var(--tear)_100%,transparent_97%,#000_100%)]",
        "transition-[translate,filter] duration-150",
        "hover:enabled:-translate-y-0.5 active:enabled:translate-y-0",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-2 py-3 pl-5 pr-4 text-sm font-semibold">
        {children}
      </span>

      {/* The perforation, dashed through the full height at the tear line. */}
      <span
        aria-hidden
        className="absolute inset-y-1.5 w-px [background-image:repeating-linear-gradient(to_bottom,currentColor_0_4px,transparent_4px_9px)] opacity-40"
        style={{ left: "var(--tear)" }}
      />

      <span
        aria-hidden
        className={cn(
          "flex items-center justify-center py-3 pl-4 pr-5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em]",
          "opacity-70 transition-[opacity,translate] duration-150 group-hover:enabled:opacity-100",
        )}
        style={{ width: stubWidth }}
      >
        {stub}
      </span>
    </button>
  )
}
