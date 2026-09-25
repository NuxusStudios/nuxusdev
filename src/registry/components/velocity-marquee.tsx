"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export const VELOCITY_ROWS: string[][] = [
  ["Components", "Themes", "Templates", "Prompts"],
  ["Copy the source", "Keep the source", "Change the source"],
  ["Live preview", "Your tokens", "No lock-in", "MIT"],
]

/** One row. Kept separate so each can own its loop without re-rendering the page. */
function Row({
  words,
  speed,
  direction,
  className,
}: {
  words: string[]
  speed: number
  direction: 1 | -1
  className?: string
}) {
  const stripRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const copyRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const strip = stripRef.current
    const track = trackRef.current
    const copy = copyRef.current
    if (!strip || !track || !copy) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let offset = 0
    let span = copy.offsetWidth
    let velocity = 0
    let lastScroll = window.scrollY
    let lastTime = 0
    let frame = 0
    let onscreen = true

    const step = (now: number) => {
      // First frame has no previous timestamp; assume one frame at 60Hz rather
      // than letting a zero-length delta swallow the whole first move.
      const dt = lastTime ? Math.min((now - lastTime) / 16.667, 4) : 1
      lastTime = now

      const scrolled = window.scrollY - lastScroll
      lastScroll = window.scrollY
      // Scrolling adds a shove in the scroll's own direction, which then bleeds
      // away. Without the decay the row would keep whatever speed the last
      // flick gave it for good.
      velocity += scrolled * 0.55
      velocity *= 0.9

      offset += (speed * direction + velocity) * dt
      // Wrap against one copy's width, so the seam falls where the list repeats.
      if (span > 0) offset = ((offset % span) + span) % span

      const skew = Math.max(-12, Math.min(12, velocity * 0.22))
      track.style.transform = `translate3d(${(-offset).toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`

      frame = requestAnimationFrame(step)
    }

    const start = () => {
      if (frame) return
      // Re-seed both clocks: a row that was off-screen for ten seconds must not
      // wake up and apply ten seconds of scrolling in one frame.
      lastTime = 0
      lastScroll = window.scrollY
      frame = requestAnimationFrame(step)
    }

    const stop = () => {
      if (!frame) return
      cancelAnimationFrame(frame)
      frame = 0
    }

    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) onscreen = entry.isIntersecting
        if (onscreen) start()
        else stop()
      },
      { rootMargin: "128px" },
    )
    seen.observe(strip)

    const resize = new ResizeObserver(() => {
      span = copy.offsetWidth
    })
    resize.observe(copy)

    start()
    return () => {
      stop()
      seen.disconnect()
      resize.disconnect()
    }
  }, [direction, speed])

  return (
    <div ref={stripRef} className={cn("w-full overflow-hidden", className)}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        {/*
          Four copies, not two: the wrap is one copy wide, so the track has to
          stay wider than the viewport at every offset. A short word list on a
          wide screen would otherwise run out of content before the seam.
        */}
        {[0, 1, 2, 3].map((copy) => (
          <div
            key={copy}
            ref={copy === 0 ? copyRef : undefined}
            aria-hidden={copy !== 0}
            className="flex shrink-0 items-center"
          >
            {words.map((word) => (
              <span key={word} className="flex items-center">
                <span className="whitespace-nowrap px-6 text-[clamp(1.75rem,5vw,3.25rem)] font-semibold tracking-tight">
                  {word}
                </span>
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Rows of type that drift on their own and lurch when the page is scrolled.
 *
 * The velocity is sampled once a frame from `scrollY` rather than accumulated
 * in a scroll handler. Scroll events fire in bursts that have nothing to do
 * with the refresh rate, so adding them up there makes the shove depend on how
 * chatty the browser felt like being.
 *
 * Every row wraps against the width of one copy of its own list, measured, so
 * changing the words or the font never leaves a gap at the seam.
 */
export function VelocityMarquee({
  rows = VELOCITY_ROWS,
  className,
}: {
  rows?: string[][]
  className?: string
}) {
  return (
    <section
      className={cn(
        "w-full overflow-hidden border-y border-border bg-background py-14 text-foreground",
        className,
      )}
    >
      <div className="flex flex-col gap-3">
        {rows.map((words, i) => (
          <Row
            key={i}
            words={words}
            // Alternating direction is what stops three rows reading as one block.
            direction={i % 2 === 0 ? 1 : -1}
            speed={1.5 + i * 0.5}
            className={i % 2 === 1 ? "text-muted-foreground" : undefined}
          />
        ))}
      </div>
    </section>
  )
}
