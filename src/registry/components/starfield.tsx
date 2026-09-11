"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A field of slowly twinkling stars.
 *
 * Positions are generated once from a seeded pseudo-random sequence rather than
 * Math.random, so the server and client render the same field and hydration
 * doesn't complain.
 */
function seeded(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

export function Starfield({
  count = 80,
  seed = 7,
  className,
}: {
  count?: number
  /** change this for a different arrangement */
  seed?: number
  className?: string
}) {
  const stars = React.useMemo(() => {
    const random = seeded(seed)
    return Array.from({ length: count }, () => ({
      x: random() * 100,
      y: random() * 100,
      size: 0.5 + random() * 1.6,
      delay: random() * 6,
      duration: 3 + random() * 4,
    }))
  }, [count, seed])

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {stars.map((star, index) => (
        <span
          key={index}
          className={cn(
            "absolute rounded-full bg-foreground",
            "animate-[twinkle_var(--star-duration)_ease-in-out_infinite]",
            "motion-reduce:animate-none motion-reduce:opacity-50"
          )}
          style={
            {
              "--star-duration": `${star.duration}s`,
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50%      { opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
