"use client"

import { cn } from "@/lib/utils"

interface Orb {
  /** percentage positions, so the layout scales with the container */
  x: number
  y: number
  size: number
  delay: number
  tone: "primary" | "accent" | "foreground"
}

const DEFAULT_ORBS: Orb[] = [
  { x: 20, y: 30, size: 38, delay: 0, tone: "primary" },
  { x: 76, y: 26, size: 30, delay: -6, tone: "primary" },
  { x: 50, y: 78, size: 42, delay: -12, tone: "foreground" },
]

const TONE = {
  primary: "var(--color-primary)",
  accent: "var(--color-accent)",
  // heavily muted: a full-strength foreground orb reads as fog once blurred
  // across half the container
  foreground: "color-mix(in oklab, var(--color-foreground) 22%, transparent)",
} as const

/**
 * Soft blurred orbs drifting behind content.
 *
 * Colours come from the theme, so this takes on whatever palette the project
 * already has rather than importing someone else's brand.
 */
export function GradientOrbs({
  orbs = DEFAULT_ORBS,
  intensity = 0.45,
  className,
}: {
  orbs?: Orb[]
  /** 0–1 opacity of each orb */
  intensity?: number
  className?: string
}) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {orbs.map((orb, index) => (
        <div
          key={index}
          className={cn(
            "absolute rounded-full blur-3xl",
            "animate-[orb-drift_18s_ease-in-out_infinite_alternate]",
            "motion-reduce:animate-none"
          )}
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${orb.size}%`,
            aspectRatio: "1",
            translate: "-50% -50%",
            opacity: intensity,
            background: `radial-gradient(circle at 30% 30%, ${TONE[orb.tone]}, transparent 70%)`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}

      <style>{`
        @keyframes orb-drift {
          from { transform: translate(0, 0) scale(1); }
          to   { transform: translate(6%, -8%) scale(1.15); }
        }
      `}</style>
    </div>
  )
}
