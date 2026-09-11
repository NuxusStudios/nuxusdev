"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Slide {
  title: string
  caption?: string
  background: string
}

/**
 * Scroll-snap carousel. Arrows and dots drive `scrollTo`, and the active dot
 * comes from an IntersectionObserver, so dragging stays in sync for free.
 */
export function ImageCarousel({ slides, className }: { slides: Slide[]; className?: string }) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index))
          }
        }
      },
      { root: track, threshold: 0.6 }
    )

    for (const child of track.children) observer.observe(child)
    return () => observer.disconnect()
  }, [slides.length])

  const goTo = (index: number) => {
    const track = trackRef.current
    if (!track) return
    const clamped = (index + slides.length) % slides.length
    const child = track.children[clamped] as HTMLElement | undefined
    child?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" })
  }

  return (
    <div className={cn("relative", className)}>
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.title}
            data-index={index}
            className="relative aspect-[16/9] w-full shrink-0 snap-start overflow-hidden"
            style={{ background: slide.background }}
          >
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-lg font-semibold text-white">{slide.title}</p>
              {slide.caption && <p className="mt-1 text-sm text-white/60">{slide.caption}</p>}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => goTo(active - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={() => goTo(active + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
      >
        <ChevronRight className="size-4" />
      </button>

      <div className="mt-4 flex justify-center gap-1.5">
        {slides.map((slide, index) => (
          <button
            key={slide.title}
            onClick={() => goTo(index)}
            aria-label={`Go to ${slide.title}`}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              index === active ? "w-6 bg-white" : "w-1.5 bg-white/25 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  )
}
