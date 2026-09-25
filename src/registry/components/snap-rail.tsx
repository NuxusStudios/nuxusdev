"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RailSlide {
  id: string
  kicker: string
  title: string
  body: string
  src: string
}

function shot(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=800&h=1000&fit=crop&q=75&auto=format`
}

export const RAIL_SLIDES: RailSlide[] = [
  { id: "north", kicker: "Field notes", title: "The long way north", body: "Nine days, one road, and a van that only just made it.", src: shot("1506905925346-21bda4d32df4") },
  { id: "harbour", kicker: "Field notes", title: "Harbour, six a.m.", body: "Everyone else asleep, and the water perfectly flat.", src: shot("1507525428034-b723cf961d3e") },
  { id: "ridge", kicker: "Field notes", title: "Above the ridge", body: "Cloud below, sun above, nothing else for an hour.", src: shot("1464822759023-fed622ff2c3b") },
  { id: "pines", kicker: "Field notes", title: "Under the pines", body: "Light comes down in columns and it is very quiet.", src: shot("1441974231531-c6227db76b6e") },
  { id: "dunes", kicker: "Field notes", title: "Out on the dunes", body: "Sand moves all night and the map is wrong by morning.", src: shot("1509316975850-ff9c5deb0cd9") },
  { id: "falls", kicker: "Field notes", title: "Below the falls", body: "You feel it before you hear it, then you cannot hear anything.", src: shot("1432405972618-c60b0225b8f9") },
]

/**
 * A rail that is a real scroll container, snapped to its cards.
 *
 * The browser already does momentum, rubber-banding, trackpad gestures, touch
 * and a keyboard — a transform-driven carousel reimplements all of it, and
 * misses at least one. This one scrolls, and everything else reads the scroll
 * rather than driving it.
 *
 * Which means the arrows and the scrubber are not two sources of truth. Both
 * write `scrollLeft`, the scroll handler reports what happened, and the
 * position stays right even when it was a finger that moved it.
 *
 * Arrows step by a card's measured width, not a guessed pixel count, so the
 * step lands on a snap point at every breakpoint.
 */
export function SnapRail({
  slides = RAIL_SLIDES,
  eyebrow = "Recently",
  title = "Somewhere else entirely",
  className,
}: {
  slides?: RailSlide[]
  eyebrow?: string
  title?: string
  className?: string
}) {
  const railRef = React.useRef<HTMLDivElement>(null)
  const [progress, setProgress] = React.useState(0)
  const [thumb, setThumb] = React.useState(0.3)
  const [ends, setEnds] = React.useState({ start: true, finish: false })

  React.useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    let queued = false

    const read = () => {
      queued = false
      const span = rail.scrollWidth - rail.clientWidth
      const ratio = span > 0 ? rail.scrollLeft / span : 0
      setProgress(ratio)
      setThumb(rail.scrollWidth > 0 ? rail.clientWidth / rail.scrollWidth : 1)
      // A pixel of slack: scrollLeft is fractional on a zoomed or scaled page
      // and never lands exactly on the span.
      setEnds({ start: rail.scrollLeft <= 1, finish: rail.scrollLeft >= span - 1 })
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(read)
    }

    onScroll()
    rail.addEventListener("scroll", onScroll, { passive: true })
    const observer = new ResizeObserver(onScroll)
    observer.observe(rail)
    return () => {
      rail.removeEventListener("scroll", onScroll)
      observer.disconnect()
    }
  }, [slides])

  const step = (dir: -1 | 1) => {
    const rail = railRef.current
    if (!rail) return
    // One card, measured: a hard-coded width would miss the snap point on
    // every breakpoint but the one it was written for.
    const card = rail.querySelector<HTMLElement>("[data-slide]")
    const by = card ? card.offsetWidth + 16 : rail.clientWidth * 0.8
    rail.scrollBy({ left: dir * by, behavior: "smooth" })
  }

  const scrub = (event: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current
    if (!rail) return
    const track = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - track.left) / track.width))
    rail.scrollTo({ left: ratio * (rail.scrollWidth - rail.clientWidth), behavior: "auto" })
  }

  return (
    <section className={cn("w-full bg-background py-20 text-foreground", className)}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 pb-8 md:px-6">
        <div>
          {eyebrow ? (
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Arrow label="Scroll left" onClick={() => step(-1)} disabled={ends.start}>
            <ChevronLeft aria-hidden className="size-4" />
          </Arrow>
          <Arrow label="Scroll right" onClick={() => step(1)} disabled={ends.finish}>
            <ChevronRight aria-hidden className="size-4" />
          </Arrow>
        </div>
      </div>

      <div
        ref={railRef}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={title}
        className={cn(
          // No `scroll-smooth` here: CSS smooth scrolling wins over
          // `behavior: "auto"`, so a scrubber drag would ease towards every
          // intermediate position instead of tracking the finger. The arrows
          // ask for smooth explicitly; everything else stays instant.
          "flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:px-6",
          "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
        )}
      >
        {slides.map((slide, i) => (
          <article
            key={slide.id}
            data-slide=""
            // The first card aligns to the start so the rail does not open
            // with half a card hanging off the left edge.
            className={cn(
              "group/slide relative shrink-0 overflow-hidden rounded-2xl border border-border",
              "w-[78%] sm:w-[46%] lg:w-[31%]",
              i === 0 ? "snap-start" : "snap-center",
            )}
          >
            <img
              src={slide.src}
              alt=""
              loading={i < 3 ? "eager" : "lazy"}
              draggable={false}
              className="block aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover/slide:scale-[1.04]"
            />
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-primary">
                {slide.kicker}
              </span>
              <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{slide.title}</h3>
              <p className="mt-1 text-pretty text-[0.78rem] leading-relaxed text-muted-foreground">
                {slide.body}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-6">
        <div
          role="presentation"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            scrub(event)
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) scrub(event)
          }}
          className="h-1.5 w-full cursor-pointer touch-none rounded-full bg-foreground/10"
        >
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${Math.max(thumb, 0.08) * 100}%`,
              // The thumb travels the track minus its own width, which is what
              // keeps its right edge flush at the end instead of overshooting.
              transform: `translateX(${(progress * (1 / Math.max(thumb, 0.08) - 1)) * 100}%)`,
            }}
          />
        </div>
      </div>
    </section>
  )
}

function Arrow({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground",
        "transition-colors hover:border-foreground/25 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-35",
      )}
    >
      {children}
    </button>
  )
}
