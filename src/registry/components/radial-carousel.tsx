"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RadialItem {
  id: string
  label: string
  title: string
  body: string
  src: string
}

function shot(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=400&h=400&fit=crop&q=75&auto=format`
}

export const RADIAL_ITEMS: RadialItem[] = [
  { id: "type", label: "Type", title: "Type that holds up", body: "Scales that survive a long headline and a short one.", src: shot("1467003909585-2f8a72700288") },
  { id: "colour", label: "Colour", title: "Colour from your tokens", body: "Nothing hard-codes a hex, so every theme lands.", src: shot("1502691876148-a84978e59af8") },
  { id: "motion", label: "Motion", title: "Motion with a reason", body: "Every transition points at what just changed.", src: shot("1470252649378-9c29740c9fa8") },
  { id: "space", label: "Space", title: "Space you can count", body: "One scale, used everywhere, argued about once.", src: shot("1517816743773-6e0fd518b4a6") },
  { id: "depth", label: "Depth", title: "Depth without murk", body: "Elevation that survives a light background.", src: shot("1519681393784-d120267933ba") },
  { id: "voice", label: "Voice", title: "Words in one voice", body: "Labels written by someone, not generated.", src: shot("1497366216548-37526070297c") },
]

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"
const SPIN_MS = 700

/**
 * A turntable of thumbnails with the selection held at the top.
 *
 * The wheel carries one rotation and the thumbnails ride it, which is what
 * makes them travel along the circle. Giving each thumbnail its own angle
 * instead would let the browser interpolate between two composite transforms,
 * and they would cut across the middle rather than go round.
 *
 * Each thumbnail then unwinds both rotations so it stays the right way up — a
 * ferris wheel rather than a turntable, because a face rotating through 180
 * degrees is unreadable for half its trip.
 *
 * The radius is measured rather than set in a percentage: `translateY(-42%)`
 * inside a transform resolves against the element's own height, which is the
 * thumbnail, not the circle it is meant to be describing.
 */
export function RadialCarousel({
  items = RADIAL_ITEMS,
  className,
}: {
  items?: RadialItem[]
  className?: string
}) {
  const [active, setActive] = React.useState(0)
  const [radius, setRadius] = React.useState(0)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const step = 360 / Math.max(items.length, 1)

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const read = () =>
      setRadius((prev) => {
        const next = stage.clientWidth * 0.38
        return Math.abs(prev - next) < 0.5 ? prev : next
      })
    read()
    const observer = new ResizeObserver(read)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  // Unbounded, so stepping from the last item to the first keeps turning the
  // same way instead of unwinding the whole wheel backwards.
  const shift = (by: number) => setActive((prev) => prev + by)
  const index = ((active % items.length) + items.length) % items.length
  const current = items[index]!

  return (
    <section
      className={cn(
        "flex w-full flex-col items-center gap-10 overflow-hidden bg-background px-6 py-20 text-foreground",
        className,
      )}
    >
      <div
        ref={stageRef}
        role="group"
        aria-roledescription="carousel"
        aria-label={current.title}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
          event.preventDefault()
          shift(event.key === "ArrowLeft" ? -1 : 1)
        }}
        className={cn(
          "relative aspect-square w-full max-w-md select-none",
          "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        )}
      >
        {/* The dial the thumbnails are pinned to. */}
        <div
          aria-hidden
          className="absolute inset-[12%] rounded-full border border-dashed border-border/70"
        />

        <div
          className="absolute inset-0"
          style={{
            transform: `rotate(${-active * step}deg)`,
            transition: `transform ${SPIN_MS}ms ${EASE}`,
          }}
        >
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => shift(closestStep(i, index, items.length))}
              aria-label={`Show ${item.title}`}
              aria-current={i === index}
              style={{
                transform: `translate(-50%, -50%) rotate(${i * step}deg) translateY(-${radius}px) rotate(${(active - i) * step}deg)`,
                transition: `transform ${SPIN_MS}ms ${EASE}`,
              }}
              className={cn(
                "absolute left-1/2 top-1/2 size-20 overflow-hidden rounded-full border-2",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                i === index ? "border-primary" : "border-border",
              )}
            >
              <img
                src={item.src}
                alt=""
                loading="eager"
                draggable={false}
                className={cn(
                  "size-full object-cover transition-[filter,opacity] duration-500",
                  i === index ? "opacity-100 saturate-100" : "opacity-60 saturate-[0.3]",
                )}
              />
            </button>
          ))}
        </div>

        {/* The hub. Sits above the wheel and never turns. */}
        <div className="absolute inset-[26%] flex flex-col items-center justify-center rounded-full border border-border bg-card px-6 text-center">
          <span className="text-[0.62rem] font-medium uppercase tracking-[0.2em] text-primary">
            {current.label}
          </span>
          <h3 className="mt-2 text-balance text-lg font-semibold leading-tight tracking-tight">
            {current.title}
          </h3>
          <p className="mt-1.5 text-pretty text-[0.72rem] leading-relaxed text-muted-foreground">
            {current.body}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Step label="Previous" onClick={() => shift(-1)}>
          <ChevronLeft aria-hidden className="size-4" />
        </Step>
        <span className="font-mono text-[0.72rem] text-muted-foreground">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <Step label="Next" onClick={() => shift(1)}>
          <ChevronRight aria-hidden className="size-4" />
        </Step>
      </div>
    </section>
  )
}

/** Steps to reach `target` from `from`, taking the short way round. */
function closestStep(target: number, from: number, length: number) {
  const half = length / 2
  return ((target - from + length + Math.floor(half)) % length) - Math.floor(half)
}

function Step({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground",
        "transition-colors hover:border-foreground/25 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {children}
    </button>
  )
}
