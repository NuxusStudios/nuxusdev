"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CoverflowSlide {
  src: string
  alt: string
  title?: string
  subtitle?: string
}

const DEFAULT_SLIDES: CoverflowSlide[] = [
  { src: img("1506744038136-46273834b3fb"), alt: "Still water beneath a ridgeline", title: "Still Water", subtitle: "Long player" },
  { src: img("1441974231531-c6227db76b6e"), alt: "Light through a dense stand of trees", title: "Understory", subtitle: "Single" },
  { src: img("1470071459604-3b5ec3a7fe05"), alt: "Fog in a forested valley at first light", title: "Low Country", subtitle: "Long player" },
  { src: img("1500530855697-b586d89ba3ee"), alt: "A road running into open country", title: "Third Rail", subtitle: "EP" },
  { src: img("1418065460487-3e41a6c84dc5"), alt: "Hills under a hard blue sky", title: "Dry Season", subtitle: "EP" },
  { src: img("1433086966358-54859d0ed716"), alt: "A waterfall under a stone bridge", title: "Undertow", subtitle: "Single" },
  { src: img("1501785888041-af3ef285b470"), alt: "A mountain lake mirroring the sky", title: "Open Palm", subtitle: "Single" },
]

function img(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=640&h=640&fit=crop&q=70&auto=format`
}

/**
 * A cover-flow carousel: cards recede and rotate away from the centre.
 *
 * Position is a single fractional number rather than an index, which is what
 * lets a drag land between cards and settle from wherever it was let go. Every
 * card's transform is derived from its distance to that number, so looping is
 * just folding the distance into the shorter way round the ring — no cloned
 * nodes and no reordering the DOM.
 *
 * Transforms are written straight to the elements during the settle. Putting
 * the position in React state would re-render every card sixty times a second
 * for numbers React has no use for.
 */
export function CoverflowCarousel({
  slides = DEFAULT_SLIDES,
  cardWidth = "clamp(150px, 22vw, 260px)",
  tilt = 46,
  recede = 0.58,
  spacing = 1.05,
  showCaption = true,
  showArrows = true,
  showDots = true,
  label = "Cover carousel",
  className,
}: {
  slides?: CoverflowSlide[]
  /** any CSS length; everything else scales off it */
  cardWidth?: string
  /** degrees the neighbouring card turns away */
  tilt?: number
  /** how far it recedes, as a fraction of card width */
  recede?: number
  /** centre-to-centre distance, as a multiple of card width */
  spacing?: number
  showCaption?: boolean
  showArrows?: boolean
  showDots?: boolean
  label?: string
  className?: string
}) {
  const count = slides.length
  const stageRef = React.useRef<HTMLDivElement>(null)
  const cardRefs = React.useRef<(HTMLDivElement | null)[]>([])

  const position = React.useRef(0)
  const destination = React.useRef(0)
  const width = React.useRef(0)
  const raf = React.useRef<number | null>(null)
  const drag = React.useRef<{ id: number; x: number; from: number; velocity: number; at: number } | null>(null)

  const [current, setCurrent] = React.useState(0)
  const reduced = useReducedMotion()

  const normalise = React.useCallback(
    (value: number) => ((Math.round(value) % count) + count) % count,
    [count]
  )

  const paint = React.useCallback(() => {
    const cardWidthPx = width.current
    if (!cardWidthPx) return

    const pitch = cardWidthPx * spacing
    const centre = position.current

    cardRefs.current.forEach((card, index) => {
      if (!card) return

      // fold onto the shorter arc so card 0 can sit to the left of card n-1
      let offset = ((index - centre) % count + count) % count
      if (offset > count / 2) offset -= count

      const distance = Math.abs(offset)
      // square root rather than linear: a linear ramp shuts the second card
      // almost edge-on and you lose the sense of a row continuing behind
      const ramp = Math.sqrt(distance)
      const angle = Math.min(tilt * ramp, 78) * Math.sign(offset)

      card.style.transform =
        `translate(-50%, 0) translateX(${offset * pitch}px) ` +
        `translateZ(${-recede * cardWidthPx * ramp}px) rotateY(${-angle}deg)`

      // a card is teleported across the ring at exactly half a turn out, so it
      // has to have faded before it gets there or the jump is visible
      const edge = Math.min(1, Math.max(0, count / 2 - distance))
      card.style.opacity = String(Math.max(0, 1 - 0.12 * distance) * edge)
      card.style.zIndex = String(100 - Math.round(distance))
    })
  }, [count, recede, spacing, tilt])

  const settle = React.useCallback(
    (to: number) => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
      destination.current = to
      setCurrent(normalise(to))

      if (reduced) {
        position.current = to
        paint()
        return
      }

      const step = () => {
        const remaining = to - position.current
        if (Math.abs(remaining) < 0.0005) {
          position.current = to
          paint()
          raf.current = null
          return
        }
        position.current += remaining * 0.16
        paint()
        raf.current = requestAnimationFrame(step)
      }
      raf.current = requestAnimationFrame(step)
    },
    [normalise, paint, reduced]
  )

  const goTo = React.useCallback(
    (index: number) => {
      // travel the short way rather than unwinding the whole ring
      const to = index + Math.round((destination.current - index) / count) * count
      settle(to)
    },
    [count, settle]
  )

  const step = React.useCallback(
    (by: number) => settle(Math.round(destination.current) + by),
    [settle]
  )

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const measure = () => {
      width.current = cardRefs.current[0]?.offsetWidth ?? 0
      paint()
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [paint])

  React.useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    },
    []
  )

  const active = slides[current]

  return (
    <div
      className={cn("w-full", className)}
      style={{ ["--cover-w" as string]: cardWidth }}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
    >
      <div className="relative">
        <div
          ref={stageRef}
          tabIndex={0}
          className={cn(
            "cursor-grab overflow-hidden py-10 outline-none active:cursor-grabbing",
            "focus-visible:ring-2 focus-visible:ring-ring"
          )}
          style={{
            perspective: "calc(var(--cover-w) * 3)",
            // the page keeps vertical scrolling; horizontal drag is ours
            touchAction: "pan-y",
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault()
              step(-1)
            } else if (event.key === "ArrowRight") {
              event.preventDefault()
              step(1)
            }
          }}
          onPointerDown={(event) => {
            if (raf.current !== null) {
              cancelAnimationFrame(raf.current)
              raf.current = null
            }
            event.currentTarget.setPointerCapture(event.pointerId)
            destination.current = position.current
            drag.current = {
              id: event.pointerId,
              x: event.clientX,
              from: position.current,
              velocity: 0,
              at: performance.now(),
            }
          }}
          onPointerMove={(event) => {
            const state = drag.current
            if (!state || state.id !== event.pointerId) return

            const pitch = width.current * spacing
            if (!pitch) return

            const now = performance.now()
            const previous = position.current
            position.current = state.from - (event.clientX - state.x) / pitch

            // cards per second, for the throw
            state.velocity = ((position.current - previous) / Math.max(now - state.at, 1)) * 1000
            state.at = now

            const index = normalise(position.current)
            if (index !== current) setCurrent(index)
            paint()
          }}
          onPointerUp={(event) => {
            const state = drag.current
            if (!state || state.id !== event.pointerId) return
            drag.current = null
            // let a flick carry, but never more than two cards
            const carried = Math.max(-2, Math.min(2, state.velocity * 0.18))
            settle(Math.round(position.current + carried))
          }}
          onPointerCancel={() => {
            drag.current = null
            settle(Math.round(position.current))
          }}
        >
          <div
            className="relative select-none"
            style={{ height: "var(--cover-w)", transformStyle: "preserve-3d" }}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.src}
                ref={(node) => {
                  cardRefs.current[index] = node
                }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${count}`}
                className="absolute left-1/2 top-0 aspect-square overflow-hidden rounded-2xl bg-muted shadow-xl will-change-transform"
                style={{ width: "var(--cover-w)" }}
              >
                {/*
                  Eager on purpose. Inside a 3D-transformed, clipped stage the
                  browser treats lazy images as off-screen and never fetches
                  them — every card stays blank. A carousel's images are the
                  content anyway.
                */}
                <img
                  src={slide.src}
                  alt={slide.alt}
                  draggable={false}
                  decoding="async"
                  className="size-full select-none object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {showArrows && (
          <>
            <ArrowButton side="left" onClick={() => step(-1)} />
            <ArrowButton side="right" onClick={() => step(1)} />
          </>
        )}
      </div>

      {showCaption && active?.title && (
        <div key={current} className="mt-2 flex flex-col items-center px-6 text-center">
          <p className="text-[15px] font-semibold tracking-tight text-foreground">{active.title}</p>
          {active.subtitle && (
            <p className="mt-1 text-[13px] text-muted-foreground">{active.subtitle}</p>
          )}
        </div>
      )}

      {showDots && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === current}
              onClick={() => goTo(index)}
              className={cn(
                "size-2 rounded-full bg-foreground transition-opacity",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                index === current ? "opacity-100" : "opacity-30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-[200] -translate-y-1/2 rounded-full bg-background/70 p-2 text-foreground backdrop-blur transition-colors hover:bg-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        side === "left" ? "left-3" : "right-3"
      )}
    >
      <Icon className="size-5" />
    </button>
  )
}

function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (callback) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)")
      query.addEventListener("change", callback)
      return () => query.removeEventListener("change", callback)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
}

export default CoverflowCarousel
