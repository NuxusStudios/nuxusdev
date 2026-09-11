"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * A theme-coloured gradient with film grain over it.
 *
 * The grain is an SVG turbulence filter rather than a tiled PNG, so it costs
 * nothing to download and never repeats visibly.
 */
export function NoiseGradient({
  opacity = 0.22,
  grain = 0.8,
  className,
}: {
  /** strength of the grain, 0–1 */
  opacity?: number
  /** turbulence frequency; higher is finer */
  grain?: number
  className?: string
}) {
  const id = useId()

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 [background:radial-gradient(120%_100%_at_50%_0%,var(--color-primary)_0%,transparent_55%),radial-gradient(90%_80%_at_10%_100%,var(--color-accent)_0%,transparent_60%)] opacity-40" />

      <svg className="absolute inset-0 h-full w-full mix-blend-overlay" style={{ opacity }}>
        <filter id={`${id}-grain`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={grain}
            numOctaves={3}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id}-grain)`} />
      </svg>
    </div>
  )
}
