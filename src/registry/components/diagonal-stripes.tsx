"use client"

import { cn } from "@/lib/utils"

/**
 * Repeating diagonal stripes that travel slowly.
 *
 * One repeating-linear-gradient animated by background-position, which stays
 * on the compositor and costs nothing to scale to any size.
 */
export function DiagonalStripes({
  width = 14,
  angle = 45,
  speed = 20,
  className,
}: {
  /** stripe width in pixels */
  width?: number
  /** stripe angle in degrees */
  angle?: number
  /** seconds for one repeat of travel */
  speed?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        "animate-[stripe-travel_var(--stripe-speed)_linear_infinite]",
        "motion-reduce:animate-none",
        className
      )}
      style={
        {
          "--stripe-speed": `${speed}s`,
          "--stripe-size": `${width * 2}px`,
          backgroundImage: `repeating-linear-gradient(${angle}deg, var(--color-border) 0, var(--color-border) 1px, transparent 1px, transparent ${width}px)`,
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes stripe-travel {
          to { background-position: var(--stripe-size) var(--stripe-size); }
        }
      `}</style>
    </div>
  )
}
