"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Animated mesh gradient rendered on a canvas — no WebGL, no dependencies.
 * Blobs drift on independent sine paths and are composited with `lighter`.
 */
export function MeshGradient({
  colors = ["#5b2cff", "#00d4ff", "#ff2e93", "#ffb300"],
  speed = 0.35,
  blur = 60,
  className,
}: {
  colors?: string[]
  speed?: number
  blur?: number
  className?: string
}) {
  const ref = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let t = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = "lighter"

      colors.forEach((color, i) => {
        const phase = (i / colors.length) * Math.PI * 2
        const x = w * (0.5 + 0.3 * Math.sin(t * speed + phase))
        const y = h * (0.5 + 0.3 * Math.cos(t * speed * 0.8 + phase * 1.4))
        const r = Math.max(w, h) * 0.45

        const g = ctx.createRadialGradient(x, y, 0, x, y, r)
        g.addColorStop(0, color)
        g.addColorStop(1, "transparent")
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      })

      t += 0.01
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [colors, speed])

  return (
    <canvas
      ref={ref}
      style={{ filter: `blur(${blur}px)` }}
      className={cn("size-full", className)}
    />
  )
}
