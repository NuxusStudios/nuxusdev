"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface CubeFace {
  id: string
  label: string
  title: string
  body: string
}

export const CUBE_FACES: CubeFace[] = [
  { id: "live", label: "01", title: "Runs before you take it", body: "Every component renders live in the browser, not as a screenshot." },
  { id: "yours", label: "02", title: "Source you keep", body: "Paste it in and it is yours. No runtime dependency pointing back at us." },
  { id: "theme", label: "03", title: "Your tokens, not ours", body: "Colour comes from your theme, so a paste lands in your palette." },
  { id: "agent", label: "04", title: "A prompt for every one", body: "Hand it to your agent and let it wire the component into the screen." },
]

/** Four faces around one axis: a box you see the side of, not a true cube. */
const SIDES = 4
const QUARTER = 360 / SIDES
const DRAG_PER_DEG = 2.2

/**
 * Feature panels on the faces of a box that turns, by itself or under a drag.
 *
 * The angle is kept unbounded and only ever added to, so leaving face four for
 * face one keeps turning the same way instead of unwinding three turns
 * backwards. The face on show is that angle folded back into range.
 *
 * `translateZ` is half the box's own width, measured rather than hard-coded —
 * if the two disagree the faces meet short of the corners and the box comes
 * apart at the edges as it turns.
 */
export function SpinCube({
  faces = CUBE_FACES,
  autoplay = true,
  autoplayMs = 3600,
  className,
}: {
  faces?: CubeFace[]
  autoplay?: boolean
  autoplayMs?: number
  className?: string
}) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const [half, setHalf] = React.useState(0)
  const [angle, setAngle] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const [held, setHeld] = React.useState(false)
  const drag = React.useRef({ x: 0, from: 0, moved: false })

  const shown = faces.slice(0, SIDES)
  // Fold the running angle back to a face index; negate because turning the
  // box left brings the next face round to the front.
  const front = ((Math.round(-angle / QUARTER) % SIDES) + SIDES) % SIDES

  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const read = () =>
      setHalf((prev) => {
        const next = stage.clientWidth / 2
        return Math.abs(prev - next) < 0.5 ? prev : next
      })
    read()
    const observer = new ResizeObserver(read)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  React.useEffect(() => {
    if (!autoplay || held || dragging) return
    const id = window.setInterval(() => setAngle((prev) => prev - QUARTER), autoplayMs)
    return () => window.clearInterval(id)
  }, [autoplay, autoplayMs, dragging, held])

  const goTo = (index: number) => {
    // Step to the nearest rotation showing that face, rather than jumping.
    const delta = ((index - front + SIDES + SIDES / 2) % SIDES) - SIDES / 2
    setAngle((prev) => prev - delta * QUARTER)
  }

  return (
    <section
      className={cn(
        "flex w-full flex-col items-center justify-center gap-10 bg-background px-6 py-20 text-foreground",
        className,
      )}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
    >
      <div
        ref={stageRef}
        className="w-full max-w-[22rem] [perspective:1200px] select-none"
        style={{ aspectRatio: "1 / 1" }}
      >
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label={shown[front]?.title}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
            event.preventDefault()
            setAngle((prev) => prev + (event.key === "ArrowLeft" ? QUARTER : -QUARTER))
          }}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            drag.current = { x: event.clientX, from: angle, moved: false }
            setDragging(true)
          }}
          onPointerMove={(event) => {
            if (!dragging) return
            const dx = event.clientX - drag.current.x
            if (Math.abs(dx) > 3) drag.current.moved = true
            setAngle(drag.current.from + dx / DRAG_PER_DEG)
          }}
          onPointerUp={() => {
            if (!dragging) return
            setDragging(false)
            // Land on a face, never between two.
            setAngle((prev) => Math.round(prev / QUARTER) * QUARTER)
          }}
          onPointerCancel={() => setDragging(false)}
          className={cn(
            "relative h-full w-full [transform-style:preserve-3d] touch-none",
            dragging ? "cursor-grabbing" : "cursor-grab",
            "outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          )}
          style={{
            transform: `translateZ(-${half}px) rotateY(${angle}deg)`,
            transition: dragging ? "none" : "transform 800ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          {shown.map((face, i) => (
            <article
              key={face.id}
              aria-hidden={i !== front}
              className={cn(
                "absolute inset-0 flex flex-col justify-between rounded-2xl border border-border bg-card p-6",
                "[backface-visibility:hidden]",
              )}
              style={{ transform: `rotateY(${i * QUARTER}deg) translateZ(${half}px)` }}
            >
              <span className="font-mono text-[0.7rem] tracking-[0.18em] text-primary">{face.label}</span>
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{face.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{face.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {shown.map((face, i) => (
          <button
            key={face.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Show ${face.title}`}
            aria-current={i === front}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              i === front ? "w-7 bg-primary" : "w-2 bg-foreground/25 hover:bg-foreground/45",
            )}
          />
        ))}
      </div>
    </section>
  )
}
