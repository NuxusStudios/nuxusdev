"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A field of dots that gets out of the cursor's way and drifts back.
 *
 * Every dot is moved by writing a transform straight to its node. Three hundred
 * odd dots in React state would mean three hundred odd reconciliations a frame
 * for numbers nobody renders; the DOM is the only place these values need to
 * exist.
 *
 * Home positions are computed once per resize rather than read back per frame.
 * Calling `getBoundingClientRect` on each dot every frame forces the browser to
 * re-layout the whole field before it can answer, which is the difference
 * between this costing nothing and costing everything.
 *
 * The loop stops once the field has settled and nothing is hovering it, so an
 * idle section is not burning a frame budget in the background.
 */
export function RepelGrid({
  columns = 26,
  rows = 14,
  /** Pixels of influence around the pointer. */
  radius = 150,
  /** How far a dot at the very centre of that circle is pushed. */
  strength = 42,
  className,
  children,
}: {
  columns?: number
  rows?: number
  radius?: number
  strength?: number
  className?: string
  children?: React.ReactNode
}) {
  const fieldRef = React.useRef<HTMLDivElement>(null)
  const dotsRef = React.useRef<(HTMLSpanElement | null)[]>([])
  const count = columns * rows
  const cells = React.useMemo(() => Array.from({ length: count }, (_, i) => i), [count])

  React.useEffect(() => {
    const field = fieldRef.current
    if (!field) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const nodes = dotsRef.current.slice(0, count).filter(Boolean) as HTMLSpanElement[]
    if (nodes.length === 0) return

    // Home position plus current displacement, one entry per dot.
    const state = nodes.map(() => ({ hx: 0, hy: 0, x: 0, y: 0 }))
    const pointer = { x: -9999, y: -9999, inside: false }
    let frame = 0
    let onscreen = true

    const layout = () => {
      const { width, height } = field.getBoundingClientRect()
      for (let i = 0; i < state.length; i++) {
        const col = i % columns
        const row = Math.floor(i / columns)
        // Half-step inset so the outermost dots are not clipped by the edge.
        state[i]!.hx = ((col + 0.5) / columns) * width
        state[i]!.hy = ((row + 0.5) / rows) * height
      }
    }

    const step = () => {
      let moving = false
      for (let i = 0; i < state.length; i++) {
        const s = state[i]!
        let tx = 0
        let ty = 0

        if (pointer.inside) {
          const dx = s.hx - pointer.x
          const dy = s.hy - pointer.y
          const dist = Math.hypot(dx, dy)
          if (dist < radius && dist > 0.001) {
            // Squared falloff: firm near the cursor, nothing at the rim.
            const force = (1 - dist / radius) ** 2 * strength
            tx = (dx / dist) * force
            ty = (dy / dist) * force
          }
        }

        s.x += (tx - s.x) * 0.16
        s.y += (ty - s.y) * 0.16
        if (Math.abs(s.x - tx) > 0.05 || Math.abs(s.y - ty) > 0.05) moving = true

        // Swelling with the push is what makes the interaction legible: a dot
        // shifted a few pixels among three hundred others is easy to miss, and
        // the scale rides along in the transform already being written.
        const swell = 1 + Math.min(1, Math.hypot(s.x, s.y) / strength) * 0.9
        nodes[i]!.style.transform =
          `translate3d(${(s.hx + s.x).toFixed(2)}px, ${(s.hy + s.y).toFixed(2)}px, 0) scale(${swell.toFixed(3)})`
      }

      // Settled and unattended: stop until something asks for a frame.
      if (!moving && !pointer.inside) {
        frame = 0
        return
      }
      frame = requestAnimationFrame(step)
    }

    const wake = () => {
      if (frame || !onscreen) return
      frame = requestAnimationFrame(step)
    }

    const onMove = (event: PointerEvent) => {
      const rect = field.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      pointer.inside = true
      wake()
    }

    const onLeave = () => {
      pointer.inside = false
      wake()
    }

    const onResize = () => {
      layout()
      wake()
    }

    layout()
    step()

    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) onscreen = entry.isIntersecting
        if (onscreen) wake()
      },
      { rootMargin: "96px" },
    )
    seen.observe(field)

    const resize = new ResizeObserver(onResize)
    resize.observe(field)
    field.addEventListener("pointermove", onMove)
    field.addEventListener("pointerleave", onLeave)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      seen.disconnect()
      resize.disconnect()
      field.removeEventListener("pointermove", onMove)
      field.removeEventListener("pointerleave", onLeave)
    }
  }, [columns, rows, radius, strength, count])

  return (
    <section
      className={cn(
        "relative flex min-h-[32rem] w-full items-center justify-center overflow-hidden bg-background px-6 py-24 text-foreground",
        className,
      )}
    >
      <div
        ref={fieldRef}
        aria-hidden
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,black,transparent)]"
      >
        {cells.map((i) => (
          <span
            key={i}
            ref={(node) => {
              dotsRef.current[i] = node
            }}
            className="absolute left-0 top-0 -ml-[2px] -mt-[2px] size-1 rounded-full bg-foreground/30 will-change-transform"
          />
        ))}
      </div>

      <div className="relative z-10 text-center">{children}</div>
    </section>
  )
}
