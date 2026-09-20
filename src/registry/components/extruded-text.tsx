"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A headline with real depth: the same word stacked back through Z, turning
 * under the pointer.
 *
 * The extrusion is copies of the text rather than a `text-shadow` ladder,
 * because only copies are actually in the scene — a shadow stack is painted
 * flat and stays facing you while the block turns, which gives the lie away the
 * moment anything rotates.
 *
 * The pointer writes two custom properties straight onto the node instead of
 * going through state. Rotation lands on the compositor either way, and a
 * pointermove that re-renders the whole section is 60 renders a second for a
 * number React never reads.
 */
/** Where the block sits with no pointer on it. Flat-on hides the extrusion. */
const REST_RX = -7
const REST_RY = -17

export function ExtrudedText({
  text = "DEPTH",
  eyebrow = "Type, in space",
  blurb = "Move your cursor across it.",
  /** Copies behind the face. More is thicker and costs more to paint. */
  depth = 18,
  /** Degrees of travel from the resting angle to either edge. */
  sway = 20,
  className,
}: {
  text?: string
  eyebrow?: string
  blurb?: string
  depth?: number
  sway?: number
  className?: string
}) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const blockRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const stage = stageRef.current
    const block = blockRef.current
    if (!stage || !block) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let queued = false
    let nx = 0
    let ny = 0

    const write = () => {
      queued = false
      block.style.setProperty("--ry", `${(REST_RY + nx * sway).toFixed(2)}deg`)
      block.style.setProperty("--rx", `${(REST_RX - ny * sway * 0.6).toFixed(2)}deg`)
    }

    const onMove = (event: PointerEvent) => {
      const rect = stage.getBoundingClientRect()
      // -1 at the left edge, 1 at the right, whatever the stage's size.
      nx = ((event.clientX - rect.left) / rect.width) * 2 - 1
      ny = ((event.clientY - rect.top) / rect.height) * 2 - 1
      if (queued) return
      queued = true
      requestAnimationFrame(write)
    }

    const onLeave = () => {
      nx = 0
      ny = 0
      if (queued) return
      queued = true
      requestAnimationFrame(write)
    }

    stage.addEventListener("pointermove", onMove)
    stage.addEventListener("pointerleave", onLeave)
    return () => {
      stage.removeEventListener("pointermove", onMove)
      stage.removeEventListener("pointerleave", onLeave)
    }
  }, [sway])

  const copies = Array.from({ length: depth }, (_, i) => i)

  return (
    <section
      ref={stageRef}
      className={cn(
        "flex min-h-[32rem] w-full flex-col items-center justify-center gap-8 overflow-hidden bg-background px-6 py-24 text-foreground",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}

      <div className="[perspective:900px] [perspective-origin:50%_50%]">
        <div
          ref={blockRef}
          className={cn(
            "relative [transform-style:preserve-3d]",
            // A resting angle, not dead-on: at zero the copies hide exactly
            // behind the face and the whole thing reads as flat text.
            "[--rx:-7deg] [--ry:-17deg]",
            "[transform:rotateX(var(--rx))_rotateY(var(--ry))]",
            "transition-[transform] duration-500 ease-out motion-reduce:transition-none",
          )}
        >
          {/* The readable one. Everything behind it is decoration. */}
          <span className="relative z-10 block text-center text-[clamp(3rem,16vw,9rem)] font-black leading-none tracking-tight">
            {text}
          </span>

          {copies.map((i) => (
            <span
              key={i}
              aria-hidden
              style={{
                transform: `translateZ(-${(i + 1) * 5}px)`,
                // Darkens into the background the further back it sits, so the
                // side of the block reads as solid rather than as a fan of
                // outlines all painted the same brightness as the face.
                opacity: 0.88 * (1 - i / depth),
              }}
              className={cn(
                "pointer-events-none absolute inset-0 select-none text-center text-primary",
                "text-[clamp(3rem,16vw,9rem)] font-black leading-none tracking-tight",
              )}
            >
              {text}
            </span>
          ))}
        </div>
      </div>

      {blurb ? <p className="text-sm text-muted-foreground">{blurb}</p> : null}
    </section>
  )
}
