"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function frame(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=560&h=560&fit=crop&q=72&auto=format`
}

export const ORBIT_FRAMES: { src: string; alt: string }[] = [
  { src: frame("1470071459604-3b5ec3a7fe05"), alt: "Fog in a forested valley" },
  { src: frame("1418065460487-3e41a6c84dc5"), alt: "Bare hills under a hard sky" },
  { src: frame("1441974231531-c6227db76b6e"), alt: "Light through a stand of trees" },
  { src: frame("1500530855697-b586d89ba3ee"), alt: "A road running into open country" },
  { src: frame("1506744038136-46273834b3fb"), alt: "Still water beneath a ridgeline" },
  { src: frame("1433086966358-54859d0ed716"), alt: "A waterfall beneath a stone bridge" },
  { src: frame("1501785888041-af3ef285b470"), alt: "A mountain lake mirroring the sky" },
  { src: frame("1472214103451-9374bd1c798e"), alt: "A field under low afternoon sun" },
]

const RADIUS_MIN = 120
const RADIUS_MAX = 320
/** Ring radius as a share of the stage width. */
const RADIUS_RATIO = 0.55
const PERSPECTIVE_RATIO = 2.4
/** How far the ring is laid back from the viewer. */
const TILT_DEG = 38

/**
 * A carousel built as an actual ring in space: thumbnails sit on the rim, the
 * ring turns, and the frame at the front is echoed full size in the middle.
 *
 * Each thumbnail is two nested transforms — the outer one puts it on the rim,
 * the inner one cancels that rotation so the picture keeps facing the viewer
 * while the ring turns under it. Without the counter-rotation the thumbnails
 * turn edge-on and vanish for half the revolution.
 */
export function OrbitGallery({
  frames = ORBIT_FRAMES,
  autoplay = true,
  autoplayMs = 2600,
  className,
}: {
  frames?: { src: string; alt: string }[]
  autoplay?: boolean
  autoplayMs?: number
  className?: string
}) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [radius, setRadius] = React.useState(220)
  // Unbounded on purpose: the ring keeps winding in one direction rather than
  // unwinding the long way round whenever it crosses zero.
  const [turn, setTurn] = React.useState(0)
  const [held, setHeld] = React.useState(false)

  const count = frames.length
  const stepDeg = 360 / count
  const front = ((-Math.round(turn / stepDeg) % count) + count) % count
  const active = frames[front]

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const read = () =>
      setRadius((prev) => {
        const next = Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, stage.clientWidth * RADIUS_RATIO))
        return Math.abs(prev - next) < 0.5 ? prev : next
      })
    read()
    const observer = new ResizeObserver(read)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!autoplay || held || count < 2) return
    const id = window.setInterval(() => setTurn((prev) => prev + stepDeg), autoplayMs)
    return () => window.clearInterval(id)
  }, [autoplay, autoplayMs, count, held, stepDeg])

  if (!active) return null

  const ease = "transform 900ms cubic-bezier(0.22, 1, 0.36, 1)"

  return (
    <div
      className={cn("relative flex w-full select-none flex-col items-center gap-6 bg-background py-10", className)}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div
        ref={stageRef}
        className="relative flex aspect-[5/3] w-[92%] max-w-[600px] items-center justify-center"
      >
        <div className="relative h-full w-full" style={{ perspective: radius * PERSPECTIVE_RATIO }}>
          {frames.map((item, i) => {
            const angle = turn + stepDeg * i
            return (
              <div
                key={item.src}
                aria-hidden
                className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]"
                style={{ transform: `rotateY(${angle}deg)`, transition: ease }}
              >
                <div
                  className="relative overflow-hidden rounded-lg shadow-[0_6px_20px_rgb(0_0_0/0.35)] sm:rounded-xl"
                  style={{
                    // Order matters and is the whole trick. The translate runs
                    // first, in the frame the outer rotation already turned, so
                    // it pushes the card out along the rim; the counter-rotation
                    // then runs on the card's own geometry and turns it back to
                    // face the viewer. Counter-rotating first instead would
                    // cancel the orbit outright and stack every card in one spot.
                    transform: `translateZ(${radius}px) rotateX(${TILT_DEG}deg) rotateY(${-angle}deg)`,
                    transition: ease,
                  }}
                >
                  {/* Eager: a thumbnail inside a rotated, clipped stage may never
                      count as visible, and a lazy one then never loads at all. */}
                  <img
                    src={item.src}
                    alt=""
                    loading="eager"
                    draggable={false}
                    className="size-12 object-cover opacity-90 sm:size-16 md:size-20 lg:size-24"
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          {frames.map((item, i) => (
            <img
              key={item.src}
              src={item.src}
              alt={i === front ? item.alt : ""}
              aria-hidden={i !== front}
              loading="eager"
              draggable={false}
              className={cn(
                "absolute size-44 rounded-2xl object-cover shadow-[0_10px_35px_rgb(0_0_0/0.4)]",
                "transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "sm:size-48 md:size-64 lg:size-80",
              )}
              style={{ opacity: i === front ? 1 : 0, transform: i === front ? "scale(1)" : "scale(0.95)" }}
            />
          ))}
        </div>
      </div>

      <div className="z-20 flex items-center gap-3">
        <Step label="Previous frame" onClick={() => setTurn((prev) => prev - stepDeg)}>
          <ChevronLeft className="size-4" />
        </Step>
        <p className="min-w-[4.5rem] text-center font-mono text-xs tabular-nums text-muted-foreground">
          {String(front + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </p>
        <Step label="Next frame" onClick={() => setTurn((prev) => prev + stepDeg)}>
          <ChevronRight className="size-4" />
        </Step>
      </div>
    </div>
  )
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
        "flex size-10 items-center justify-center rounded-full border border-border bg-card/60 text-foreground",
        "backdrop-blur-md transition-[background-color,transform] hover:bg-card active:scale-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      )}
    >
      {children}
    </button>
  )
}
