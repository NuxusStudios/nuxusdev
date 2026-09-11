"use client"

import { cn } from "@/lib/utils"

/**
 * Concentric rings expanding from a point, like sonar.
 *
 * Each ring is one element on a staggered delay, so the effect costs a handful
 * of composited transforms rather than a canvas loop.
 */
export function RipplePulse({
  rings = 5,
  duration = 4,
  className,
}: {
  rings?: number
  /** seconds for a ring to travel from centre to edge */
  duration?: number
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden",
        className
      )}
    >
      {Array.from({ length: rings }, (_, index) => (
        <span
          key={index}
          className={cn(
            "absolute aspect-square w-[22%] rounded-full border border-primary/40",
            "animate-[ripple-out_var(--ripple-duration)_ease-out_infinite]",
            "motion-reduce:animate-none motion-reduce:opacity-30"
          )}
          style={
            {
              "--ripple-duration": `${duration}s`,
              animationDelay: `${(index * duration) / rings}s`,
            } as React.CSSProperties
          }
        />
      ))}

      <style>{`
        @keyframes ripple-out {
          from { transform: scale(0.4); opacity: 0.7; }
          to   { transform: scale(4.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
