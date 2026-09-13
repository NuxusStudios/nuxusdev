"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A monoline wordmark, one stroke per pen-lift. Letters are geometry rather
 * than glyphs on purpose: an SVG `<text>` has no measurable path length, so a
 * text-based version of this effect has to guess its dash length — or raster
 * the type over and over to binary-search it. Real paths report their length
 * exactly, which is what makes the loop land on the finished shape with no
 * dead lead-in and no idle tail.
 */
export const NUXUS_MARK: string[] = [
  "M26,112 L26,22 L86,112 L86,22",
  "M104,22 L104,76 Q104,112 134,112 Q164,112 164,76 L164,22",
  "M182,22 L242,112",
  "M242,22 L182,112",
  "M260,22 L260,76 Q260,112 290,112 Q320,112 320,76 L320,22",
  "M394,38 C388,22 348,20 346,46 C344,68 392,62 392,88 C392,114 350,112 342,96",
]

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

export function StrokeDrawHero({
  paths = NUXUS_MARK,
  label = "Nuxus",
  eyebrow = "Portfolio",
  tagline = "Interface & motion design — built in the open",
  viewBox = "0 0 420 140",
  strokeWidth = 3,
  /** Gradient start. Defaults to the theme token so the mark follows the theme. */
  from = "var(--color-primary)",
  /** Gradient end. Leave equal to `from` for a single-token fade. */
  to = "var(--color-primary)",
  /** Seconds for one full draw pass. */
  drawSeconds = 3.4,
  /** Seconds the finished mark is held before it clears. */
  holdSeconds = 1.1,
  loop = true,
  className,
  children,
}: {
  paths?: string[]
  label?: string
  eyebrow?: string
  tagline?: string
  viewBox?: string
  strokeWidth?: number
  from?: string
  to?: string
  drawSeconds?: number
  holdSeconds?: number
  loop?: boolean
  className?: string
  children?: React.ReactNode
}) {
  const gradientId = React.useId().replace(/:/g, "")
  const groupRef = React.useRef<SVGGElement>(null)

  React.useEffect(() => {
    const group = groupRef.current
    if (!group) return

    const strokes = Array.from(group.querySelectorAll("path"))
    if (strokes.length === 0) return

    const lengths = strokes.map((path) => Math.max(1, path.getTotalLength()))
    const total = lengths.reduce((sum, n) => sum + n, 0)

    // Cumulative start offset, so the strokes draw one after another.
    const starts: number[] = []
    let running = 0
    for (const length of lengths) {
      starts.push(running)
      running += length
    }

    strokes.forEach((path, i) => {
      path.style.strokeDasharray = `${lengths[i]} ${lengths[i]}`
    })

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (calm.matches) {
      strokes.forEach((path) => {
        path.style.strokeDashoffset = "0"
      })
      group.style.opacity = "1"
      return
    }

    const drawMs = Math.max(400, drawSeconds * 1000)
    const holdMs = Math.max(0, holdSeconds * 1000)
    const fadeMs = 420

    let raf: number | null = null
    let started = 0

    const write = (progress: number, opacity: number) => {
      const drawn = progress * total
      strokes.forEach((path, i) => {
        const length = lengths[i]!
        const cut = clamp(drawn - starts[i]!, 0, length)
        path.style.strokeDashoffset = String(length - cut)
      })
      group.style.opacity = String(opacity)
    }

    const tick = (now: number) => {
      if (!started) started = now
      const elapsed = now - started

      if (elapsed < drawMs) {
        write(elapsed / drawMs, 1)
      } else if (elapsed < drawMs + holdMs) {
        write(1, 1)
      } else if (!loop) {
        write(1, 1)
        raf = null
        return
      } else if (elapsed < drawMs + holdMs + fadeMs) {
        // Clear by fading the whole mark rather than un-drawing it — running
        // the stroke backwards reads as an erase, which is a different gesture.
        write(1, 1 - (elapsed - drawMs - holdMs) / fadeMs)
      } else {
        started = now
        write(0, 1)
      }

      raf = requestAnimationFrame(tick)
    }

    write(0, 1)
    raf = requestAnimationFrame(tick)
    return () => {
      if (raf !== null) cancelAnimationFrame(raf)
    }
  }, [drawSeconds, holdSeconds, loop, paths])

  return (
    <section
      className={cn(
        "relative flex min-h-[36rem] w-full flex-col items-center justify-center overflow-hidden bg-background px-6 py-20 text-foreground",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-8 text-[0.7rem] font-medium uppercase tracking-[0.35em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}

      <h1 className="sr-only">{label}</h1>
      <svg
        viewBox={viewBox}
        role="img"
        aria-label={label}
        className="h-auto w-full max-w-3xl"
      >
        <defs>
          {/* Both stops are the same token by default, separated by opacity —
              a two-token gradient only reads as one in themes whose tokens
              happen to differ in hue, which most of them don't. */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="25%">
            <stop offset="0%" stopColor={from} stopOpacity={1} />
            <stop offset="100%" stopColor={to} stopOpacity={to === from ? 0.45 : 1} />
          </linearGradient>
        </defs>
        <g
          ref={groupRef}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {paths.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </svg>

      {tagline ? (
        <p className="mt-8 max-w-md text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
          {tagline}
        </p>
      ) : null}

      <span
        aria-hidden
        className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-[0.65rem] uppercase tracking-[0.28em]">Scroll</span>
        <span className="block h-8 w-px origin-top bg-gradient-to-b from-foreground/50 to-transparent [animation:stroke-draw-cue_1.8s_ease-in-out_infinite] motion-reduce:[animation:none]" />
      </span>

      {children}

      <style>{`
        @keyframes stroke-draw-cue {
          0%, 100% { transform: scaleY(1); opacity: 0.55 }
          50% { transform: scaleY(0.55); opacity: 0.2 }
        }
      `}</style>
    </section>
  )
}
