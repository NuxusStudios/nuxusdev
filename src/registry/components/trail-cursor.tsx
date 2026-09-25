"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** What the ring will wrap itself around. */
const TARGETS = "a, button, [data-cursor]"
const RING = 36

function useMediaQuery(query: string) {
  return React.useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query)
      list.addEventListener("change", notify)
      return () => list.removeEventListener("change", notify)
    },
    () => window.matchMedia(query).matches,
    // The server has no pointer and no preference; assume the plain case.
    () => false,
  )
}

/**
 * A cursor in two parts: a dot on the pointer and a ring that catches up.
 *
 * The lag is the whole effect, and it only works if the ring is behind by a
 * consistent amount. Easing a fixed fraction of the remaining distance each
 * frame does that; a CSS transition on the position does not, because every
 * pointermove restarts it and the ring stutters instead of trailing.
 *
 * Position is written per frame, size is not. The ring wraps a link by having
 * its width and height set once, on the hover, and a CSS transition takes it
 * from there — animating width in the loop would mean a layout pass per frame
 * for something the compositor could have done for free.
 *
 * On a touch screen there is no pointer to follow and the whole thing is
 * skipped, native cursor left alone. A second cursor that never moves is worse
 * than no custom cursor at all.
 */
export function TrailCursor({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const fine = useMediaQuery("(pointer: fine)")
  const still = useMediaQuery("(prefers-reduced-motion: reduce)")
  const on = fine && !still

  const stageRef = React.useRef<HTMLDivElement>(null)
  const dotRef = React.useRef<HTMLSpanElement>(null)
  const ringRef = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const stage = stageRef.current
    const dot = dotRef.current
    const ring = ringRef.current
    if (!on || !stage || !dot || !ring) return

    const pointer = { x: 0, y: 0 }
    const trail = { x: 0, y: 0 }
    let locked: DOMRect | null = null
    let frame = 0
    let seen = false

    const step = () => {
      // The dot is exact. Anything that lags where the click will land reads
      // as broken rather than as smooth.
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`

      const goalX = locked ? locked.x + locked.width / 2 : pointer.x
      const goalY = locked ? locked.y + locked.height / 2 : pointer.y
      trail.x += (goalX - trail.x) * (locked ? 0.28 : 0.16)
      trail.y += (goalY - trail.y) * (locked ? 0.28 : 0.16)
      ring.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%)`

      frame = requestAnimationFrame(step)
    }

    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
      if (!seen) {
        // First sighting: drop the ring on the pointer rather than letting it
        // fly in from the corner it was initialised at.
        seen = true
        trail.x = pointer.x
        trail.y = pointer.y
      }
      stage.dataset.live = "on"
    }

    const shape = (width: number, height: number, radius: string) => {
      ring.style.width = `${width}px`
      ring.style.height = `${height}px`
      ring.style.borderRadius = radius
    }

    const onOver = (event: PointerEvent) => {
      const hit = (event.target as Element | null)?.closest?.(TARGETS)
      if (!(hit instanceof HTMLElement)) return
      const box = hit.getBoundingClientRect()
      const rect = stage.getBoundingClientRect()
      // Stored relative to the stage, so scrolling the page does not drag the
      // ring off the thing it is holding.
      locked = new DOMRect(box.x - rect.x, box.y - rect.y, box.width, box.height)
      shape(box.width + 10, box.height + 10, getComputedStyle(hit).borderRadius || "12px")
    }

    const onOut = (event: PointerEvent) => {
      const hit = (event.target as Element | null)?.closest?.(TARGETS)
      if (!hit) return
      locked = null
      shape(RING, RING, "9999px")
    }

    const onLeave = () => {
      locked = null
      shape(RING, RING, "9999px")
      delete stage.dataset.live
    }

    shape(RING, RING, "9999px")
    stage.addEventListener("pointermove", onMove)
    stage.addEventListener("pointerover", onOver)
    stage.addEventListener("pointerout", onOut)
    stage.addEventListener("pointerleave", onLeave)
    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      stage.removeEventListener("pointermove", onMove)
      stage.removeEventListener("pointerover", onOver)
      stage.removeEventListener("pointerout", onOut)
      stage.removeEventListener("pointerleave", onLeave)
    }
  }, [on])

  return (
    <div
      ref={stageRef}
      className={cn(
        "group/cursor relative w-full overflow-hidden bg-background text-foreground",
        on && "[&_*]:cursor-none cursor-none",
        className,
      )}
    >
      {on ? (
        <>
          <span
            ref={ringRef}
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-50 border border-primary/70 opacity-0",
              "transition-[width,height,border-radius,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "group-data-[live=on]/cursor:opacity-100",
            )}
          />
          <span
            ref={dotRef}
            aria-hidden
            className={cn(
              "pointer-events-none absolute left-0 top-0 z-50 size-1.5 rounded-full bg-primary opacity-0",
              "transition-opacity duration-300",
              "group-data-[live=on]/cursor:opacity-100",
            )}
          />
        </>
      ) : null}

      {children}
    </div>
  )
}
