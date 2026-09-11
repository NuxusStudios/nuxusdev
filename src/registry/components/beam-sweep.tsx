"use client"

import { cn } from "@/lib/utils"

/**
 * Wide light beams sweeping across the surface.
 *
 * Each beam is a skewed gradient strip; the sweep is a single translate, which
 * the compositor handles without touching layout.
 */
export function BeamSweep({
  beams = 3,
  duration = 9,
  className,
}: {
  beams?: number
  /** seconds for one pass */
  duration?: number
  className?: string
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {Array.from({ length: beams }, (_, index) => (
        <div
          key={index}
          className={cn(
            "absolute -inset-y-1/2 w-[18%] -skew-x-12",
            "[background:linear-gradient(to_right,transparent,var(--color-primary),transparent)]",
            "animate-[beam-sweep_var(--beam-duration)_ease-in-out_infinite]",
            "motion-reduce:animate-none"
          )}
          style={
            {
              "--beam-duration": `${duration}s`,
              left: `${index * 34 - 20}%`,
              opacity: 0.12 - index * 0.025,
              animationDelay: `${index * -2.6}s`,
            } as React.CSSProperties
          }
        />
      ))}

      <style>{`
        @keyframes beam-sweep {
          0%, 100% { transform: translateX(-60%) skewX(-12deg); }
          50%      { transform: translateX(320%) skewX(-12deg); }
        }
      `}</style>
    </div>
  )
}
