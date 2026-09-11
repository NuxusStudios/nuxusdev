"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * Stacked sine waves that drift sideways.
 *
 * One path is defined and reused with a horizontal offset, so the SVG stays
 * small however many lines are drawn.
 */
export function WavyLines({
  lines = 6,
  amplitude = 18,
  speed = 14,
  className,
}: {
  lines?: number
  /** wave height in SVG units */
  amplitude?: number
  /** seconds for one full cycle */
  speed?: number
  className?: string
}) {
  const id = useId()
  const path = `M0 50 Q 60 ${50 - amplitude}, 120 50 T 240 50 T 360 50 T 480 50`

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 240 100"
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <path id={`${id}-wave`} d={path} />
          <linearGradient id={`${id}-fade`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: lines }, (_, index) => (
          <use
            key={index}
            href={`#${id}-wave`}
            stroke={`url(#${id}-fade)`}
            strokeWidth={0.7}
            // vertical offset goes on the `y` attribute, not a transform —
            // the animation owns `transform` and would overwrite it
            y={index * 8 - 10}
            className="animate-[wave-drift_var(--wave-speed)_linear_infinite] motion-reduce:animate-none"
            style={
              {
                "--wave-speed": `${speed + index * 1.5}s`,
                animationDelay: `${index * -1.8}s`,
                opacity: 1 - index * 0.1,
              } as React.CSSProperties
            }
          />
        ))}
      </svg>

      <style>{`
        @keyframes wave-drift {
          to { transform: translateX(-240px); }
        }
      `}</style>
    </div>
  )
}
