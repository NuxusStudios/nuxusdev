"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Dashed bezier paths converging on the centre, with light travelling along
 * each one and a shockwave that bends them on click.
 *
 * Runs on a plain canvas with no dependency. The paths are static geometry —
 * only the particle parameter advances each frame — so the cost is one stroke
 * per path and one fill per particle regardless of how long it runs.
 */
export function ConvergenceField({
  paths = 72,
  speed = 1,
  interactive = true,
  className,
}: {
  /** number of converging lines */
  paths?: number
  /** multiplier on particle travel */
  speed?: number
  /** click to send a shockwave through the field */
  interactive?: boolean
  className?: string
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let width = 0
    let height = 0
    let frame = 0

    // seeded so the arrangement is stable across reloads and re-renders
    let seed = 9
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296
      return seed / 4294967296
    }

    const lines = Array.from({ length: paths }, (_, index) => ({
      fromLeft: index % 2 === 0,
      offset: index / paths,
      t: random(),
      rate: 0.0016 + random() * 0.0022,
    }))

    const waves: { x: number; y: number; radius: number; life: number }[] = []

    function resize() {
      if (!canvas) return
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const box = canvas.getBoundingClientRect()
      width = box.width
      height = box.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context!.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    /** Cubic bezier from an edge to the centre. */
    function curve(line: (typeof lines)[number]) {
      const y = line.offset * height * 1.4 - height * 0.2
      const cx = width / 2
      const cy = height / 2
      return {
        p0: { x: line.fromLeft ? 0 : width, y },
        p1: { x: line.fromLeft ? cx * 0.5 : width - cx * 0.5, y },
        p2: { x: line.fromLeft ? cx * 0.8 : width - cx * 0.8, y: cy },
        p3: { x: cx, y: cy },
      }
    }

    function at(t: number, c: ReturnType<typeof curve>) {
      const u = 1 - t
      return {
        x: u ** 3 * c.p0.x + 3 * u ** 2 * t * c.p1.x + 3 * u * t ** 2 * c.p2.x + t ** 3 * c.p3.x,
        y: u ** 3 * c.p0.y + 3 * u ** 2 * t * c.p1.y + 3 * u * t ** 2 * c.p2.y + t ** 3 * c.p3.y,
      }
    }

    // read once per frame so the field follows the theme it is dropped into
    function ink() {
      return getComputedStyle(canvas!).color
    }

    function render() {
      const colour = ink()
      context!.clearRect(0, 0, width, height)

      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].radius += 15
        waves[i].life -= 0.015
        if (waves[i].life <= 0) waves.splice(i, 1)
      }

      for (const line of lines) {
        const c = curve(line)

        context!.beginPath()
        context!.moveTo(c.p0.x, c.p0.y)
        context!.bezierCurveTo(c.p1.x, c.p1.y, c.p2.x, c.p2.y, c.p3.x, c.p3.y)
        context!.strokeStyle = colour
        context!.globalAlpha = 0.22
        context!.lineWidth = 1
        context!.setLineDash([1, 4])
        context!.stroke()
        context!.setLineDash([])

        if (!reduced) {
          line.t += line.rate * speed
          if (line.t > 1) line.t = 0
        }

        const point = at(line.t, c)
        let x = point.x
        let y = point.y

        // a wave only pushes the particles near its leading edge, so the
        // disturbance reads as a ring travelling outward
        for (const wave of waves) {
          const dx = x - wave.x
          const dy = y - wave.y
          const distance = Math.hypot(dx, dy) || 1
          const edge = Math.abs(distance - wave.radius)
          if (edge < 120) {
            const force = (1 - edge / 120) * wave.life * 80
            x += (dx / distance) * force
            y += (dy / distance) * force
          }
        }

        context!.globalAlpha = 0.75
        context!.fillStyle = colour
        context!.fillRect(x - 1.5, y - 1.5, 3, 3)
      }

      context!.globalAlpha = 1
      frame = requestAnimationFrame(render)
    }

    function onClick(event: MouseEvent) {
      if (!interactive || !canvas) return
      const box = canvas.getBoundingClientRect()
      waves.push({ x: event.clientX - box.left, y: event.clientY - box.top, radius: 0, life: 1 })
    }

    resize()
    frame = requestAnimationFrame(render)

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    canvas.addEventListener("click", onClick)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      canvas.removeEventListener("click", onClick)
    }
  }, [paths, speed, interactive, reduced])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn(
        "block size-full text-foreground",
        interactive ? "cursor-crosshair" : "pointer-events-none",
        className
      )}
    />
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

export default ConvergenceField
