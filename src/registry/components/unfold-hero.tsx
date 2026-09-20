"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * A hero whose product shot lies flat and stands up as you scroll into it.
 *
 * Progress is read from the panel's own rectangle each frame rather than from a
 * scroll offset compared against numbers measured at mount. Anything that
 * changes height after mount — a font landing, an image decoding, the address
 * bar collapsing on a phone — invalidates cached offsets, and the panel then
 * unfolds at the wrong moment for the rest of the session.
 *
 * Scroll fires far more often than the screen refreshes, so the handler only
 * marks the frame dirty and the actual write happens once per rAF.
 */
export function UnfoldHero({
  eyebrow = "New",
  title = "Your product, standing up",
  blurb = "Scroll a little. The panel lifts from flat to upright, and stays there.",
  src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&h=900&fit=crop&q=80&auto=format",
  alt = "A product dashboard",
  /** Degrees the panel is laid back before it stands up. */
  tilt = 42,
  className,
}: {
  eyebrow?: string
  title?: string
  blurb?: string
  src?: string
  alt?: string
  tilt?: number
  className?: string
}) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const stage = stageRef.current
    const panel = panelRef.current
    if (!stage || !panel) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panel.style.setProperty("--p", "1")
      return
    }

    let queued = false
    let onscreen = true

    const write = () => {
      queued = false
      const rect = stage.getBoundingClientRect()
      const vh = window.innerHeight
      // Starts at 0 while the stage's top is below three quarters of the
      // viewport and reaches 1 once it has travelled a screen further up.
      // A hero sits partly in view on load, so the run has to begin low and
      // end past the top edge — otherwise it is already upright before anyone
      // has scrolled and there is nothing to see.
      const progress = clamp01((vh * 0.72 - rect.top) / (vh * 0.92))
      panel.style.setProperty("--p", progress.toFixed(4))
    }

    const onScroll = () => {
      if (queued || !onscreen) return
      queued = true
      requestAnimationFrame(write)
    }

    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) onscreen = entry.isIntersecting
        if (onscreen) onScroll()
      },
      { rootMargin: "128px" },
    )
    seen.observe(stage)

    write()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      seen.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <section className={cn("w-full bg-background px-4 pb-32 pt-20 text-foreground md:px-6", className)}>
      <div className="mx-auto max-w-5xl text-center">
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />
            {eyebrow}
          </span>
        ) : null}

        <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          {title}
        </h1>
        {blurb ? (
          <p className="mx-auto mt-5 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {blurb}
          </p>
        ) : null}
      </div>

      <div
        ref={stageRef}
        className="mx-auto mt-16 max-w-5xl [perspective:1400px] [perspective-origin:50%_0%]"
      >
        <div
          ref={panelRef}
          style={{ ["--tilt" as string]: `${tilt}deg` }}
          className={cn(
            "relative origin-top overflow-hidden rounded-2xl border border-border bg-card shadow-[0_40px_90px_-30px_rgb(0_0_0/0.7)]",
            // Everything reads from --p, so one number drives the whole unfold.
            "[--p:0]",
            "[transform:rotateX(calc(var(--tilt)*(1-var(--p))))_scale(calc(0.92+0.08*var(--p)))]",
            "[opacity:calc(0.55+0.45*var(--p))]",
          )}
        >
          <div className="flex items-center gap-1.5 border-b border-border bg-background/60 px-4 py-2.5">
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/20" />
          </div>
          <img
            src={src}
            alt={alt}
            loading="eager"
            draggable={false}
            className="block aspect-[16/10] w-full object-cover"
          />
          {/* Sheen that slides off as the panel comes upright. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/15 to-transparent [opacity:calc(1-var(--p))]"
          />
        </div>
      </div>
    </section>
  )
}
