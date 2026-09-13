"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** Ghosts are placed along the line from the source through the centre. */
const GHOSTS = [
  { at: -0.42, size: 0.030, alpha: 0.30 },
  { at: -0.16, size: 0.016, alpha: 0.22 },
  { at: 0.24, size: 0.048, alpha: 0.26 },
  { at: 0.52, size: 0.022, alpha: 0.34 },
  { at: 0.78, size: 0.072, alpha: 0.16 },
  { at: 1.08, size: 0.034, alpha: 0.24 },
  { at: 1.44, size: 0.020, alpha: 0.30 },
]

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/**
 * An anamorphic lens flare that tracks the pointer and drifts on its own when
 * nothing is pointing at it.
 *
 * Everything is drawn in greyscale with additive compositing, and the colour is
 * a `mix-blend-multiply` layer on top rather than a tint baked into the
 * gradients. Multiply leaves black at black and turns white into the tint, so
 * the whole effect inherits the theme from one CSS class — and canvas never has
 * to parse an `oklch()` token string it may not understand.
 */
export function LensFlare({
  /** Class supplying the flare's colour. Anything that sets a background works. */
  tintClassName = "bg-primary",
  /** Ratio of stage width used as the core's radius. */
  intensity = 1,
  className,
}: {
  tintClassName?: string
  intensity?: number
  className?: string
}) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)")
    let dpr = 1
    let w = 0
    let h = 0
    let raf: number | null = null
    let onscreen = true
    let disposed = false

    // Target is where the light should be; `eased` is where it is this frame.
    const target = { x: 0.5, y: 0.42 }
    const eased = { x: 0.5, y: 0.42 }
    let tracking = false

    function measure() {
      const next = Math.min(window.devicePixelRatio || 1, 2)
      const nw = Math.max(1, Math.round(host!.clientWidth * next))
      const nh = Math.max(1, Math.round(host!.clientHeight * next))
      if (nw === w && nh === h && next === dpr) return
      dpr = next
      w = nw
      h = nh
      canvas!.width = nw
      canvas!.height = nh
    }

    function disc(x: number, y: number, r: number, alpha: number, hardness = 0.25) {
      if (r <= 0) return
      const g = ctx!.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(255,255,255,${alpha})`)
      g.addColorStop(hardness, `rgba(255,255,255,${alpha * 0.45})`)
      g.addColorStop(1, "rgba(255,255,255,0)")
      ctx!.fillStyle = g
      ctx!.beginPath()
      ctx!.arc(x, y, r, 0, Math.PI * 2)
      ctx!.fill()
    }

    /** A long thin horizontal bloom — the streak that gives it the lens look. */
    function streak(x: number, y: number, half: number, thickness: number, alpha: number) {
      const g = ctx!.createLinearGradient(x - half, y, x + half, y)
      g.addColorStop(0, "rgba(255,255,255,0)")
      g.addColorStop(0.5, `rgba(255,255,255,${alpha})`)
      g.addColorStop(1, "rgba(255,255,255,0)")
      ctx!.save()
      ctx!.translate(x, y)
      ctx!.scale(1, thickness / half)
      ctx!.translate(-x, -y)
      ctx!.fillStyle = g
      ctx!.beginPath()
      ctx!.ellipse(x, y, half, half, 0, 0, Math.PI * 2)
      ctx!.fill()
      ctx!.restore()
    }

    function draw(now: number) {
      raf = null
      if (disposed) return
      measure()

      if (!tracking) {
        // Slow lissajous drift, so an untouched hero is never completely still.
        const t = now / 1000
        target.x = 0.5 + Math.sin(t * 0.17) * 0.26
        target.y = 0.42 + Math.sin(t * 0.11 + 1.3) * 0.16
      }

      const pull = calm.matches ? 1 : 0.06
      eased.x += (target.x - eased.x) * pull
      eased.y += (target.y - eased.y) * pull

      const x = eased.x * w
      const y = eased.y * h
      const unit = Math.min(w, h)
      const core = unit * 0.13 * intensity

      ctx!.globalCompositeOperation = "source-over"
      ctx!.clearRect(0, 0, w, h)
      ctx!.globalCompositeOperation = "lighter"

      // Distance from centre drives how much flare the "lens" throws.
      const offAxis = clamp01(Math.hypot(eased.x - 0.5, eased.y - 0.5) * 1.9)

      disc(x, y, core * 2.6, 0.10, 0.12)
      disc(x, y, core, 0.55, 0.18)
      disc(x, y, core * 0.34, 0.9, 0.4)

      streak(x, y, unit * 0.52 * intensity, unit * 0.008, 0.3 + offAxis * 0.18)
      streak(x, y, unit * 0.26 * intensity, unit * 0.003, 0.34)

      // Four-point starburst, drawn as two rotated streaks.
      ctx!.save()
      ctx!.translate(x, y)
      ctx!.rotate(Math.PI / 2)
      ctx!.translate(-x, -y)
      streak(x, y, unit * 0.16 * intensity, unit * 0.0025, 0.22)
      ctx!.restore()

      const cx = w / 2
      const cy = h / 2
      for (const ghost of GHOSTS) {
        const gx = x + (cx - x) * (1 + ghost.at)
        const gy = y + (cy - y) * (1 + ghost.at)
        disc(gx, gy, unit * ghost.size * intensity, ghost.alpha * (0.35 + offAxis * 0.8), 0.7)
      }

      ctx!.globalCompositeOperation = "source-over"

      if (onscreen && !document.hidden) raf = requestAnimationFrame(draw)
    }

    function wake() {
      if (raf === null && onscreen && !document.hidden && !disposed) raf = requestAnimationFrame(draw)
    }
    function sleep() {
      if (raf !== null) {
        cancelAnimationFrame(raf)
        raf = null
      }
    }

    function onMove(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      const nx = (event.clientX - rect.left) / rect.width
      const ny = (event.clientY - rect.top) / rect.height
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return
      tracking = true
      target.x = nx
      target.y = ny
    }

    const onLeave = () => {
      tracking = false
    }
    const onVisibility = () => (document.hidden ? sleep() : wake())

    const sizes = new ResizeObserver(() => measure())
    sizes.observe(host)

    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) onscreen = entry.isIntersecting
        if (onscreen) wake()
        else sleep()
      },
      { rootMargin: "192px" },
    )
    seen.observe(host)

    window.addEventListener("pointermove", onMove, { passive: true })
    host.addEventListener("pointerleave", onLeave)
    document.addEventListener("visibilitychange", onVisibility)
    wake()

    return () => {
      disposed = true
      sleep()
      sizes.disconnect()
      seen.disconnect()
      window.removeEventListener("pointermove", onMove)
      host.removeEventListener("pointerleave", onLeave)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [intensity])

  return (
    <div
      ref={hostRef}
      className={cn("relative h-full w-full overflow-hidden bg-background", className)}
    >
      <canvas ref={canvasRef} aria-hidden className="block h-full w-full touch-none" />
      {/* Multiply turns the greyscale flare into the tint and leaves black alone. */}
      <div aria-hidden className={cn("pointer-events-none absolute inset-0 mix-blend-multiply", tintClassName)} />
    </div>
  )
}
