"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * Contour lines, like a map.
 *
 * The rings are concentric ellipses on one `<g>`, scaled outward, so the shape
 * reads as terrain without needing real elevation data.
 */
export function Topographic({
  rings = 12,
  drift = true,
  className,
}: {
  rings?: number
  /** slowly rotate the whole field */
  drift?: boolean
  className?: string
}) {
  const id = useId()

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        <defs>
          {/*
            userSpaceOnUse matters here: the default objectBoundingBox scales
            the gradient to each ellipse, which puts every stroke exactly on
            the fully transparent outer stop — the whole thing renders blank.
          */}
          <radialGradient
            id={`${id}-fade`}
            gradientUnits="userSpaceOnUse"
            cx={100}
            cy={60}
            r={110}
          >
            <stop offset="0%" stopColor="var(--color-foreground)" stopOpacity="0.45" />
            <stop offset="70%" stopColor="var(--color-foreground)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-foreground)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g
          className={cn(
            drift && "origin-center animate-[topo-drift_60s_linear_infinite]",
            "motion-reduce:animate-none"
          )}
          fill="none"
          stroke={`url(#${id}-fade)`}
          strokeWidth={0.5}
        >
          {Array.from({ length: rings }, (_, index) => (
            <ellipse
              key={index}
              cx={100}
              cy={60}
              rx={12 + index * 9}
              ry={7 + index * 5.5}
              transform={`rotate(${index * 4} 100 60)`}
            />
          ))}
        </g>
      </svg>

      <style>{`
        @keyframes topo-drift {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
