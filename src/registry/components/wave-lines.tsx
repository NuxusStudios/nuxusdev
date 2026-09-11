"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function WaveLines({
  lines = 34,
  amplitude = 26,
  speed = 0.6,
  color = "rgba(255,255,255,0.35)",
  className,
}: {
  lines?: number
  amplitude?: number
  speed?: number
  color?: string
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
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, w, h)
      ctx.lineWidth = 1

      for (let i = 0; i < lines; i++) {
        const progress = i / lines
        const y = progress * h
        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.15 + 0.85 * Math.sin(progress * Math.PI)
        for (let x = 0; x <= w; x += 6) {
          const offset =
            Math.sin(x * 0.006 + t + progress * 4) * amplitude * Math.sin(progress * Math.PI) +
            Math.sin(x * 0.013 - t * 0.7) * amplitude * 0.35
          if (x === 0) ctx.moveTo(x, y + offset)
          else ctx.lineTo(x, y + offset)
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      t += 0.01 * speed * 3
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [lines, amplitude, speed, color])

  return <canvas ref={ref} className={cn("size-full", className)} aria-hidden />
}
