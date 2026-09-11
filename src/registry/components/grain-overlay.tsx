"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** Animated film grain drawn straight into an ImageData buffer. */
export function GrainOverlay({
  opacity = 0.12,
  fps = 24,
  scale = 1.5,
  className,
}: {
  opacity?: number
  fps?: number
  scale?: number
  className?: string
}) {
  const ref = React.useRef<HTMLCanvasElement>(null)

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let last = 0
    const interval = 1000 / fps

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width / scale))
      canvas.height = Math.max(1, Math.floor(height / scale))
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw)
      if (now - last < interval) return
      last = now

      const { width: w, height: h } = canvas
      const image = ctx.createImageData(w, h)
      const data = image.data
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        data[i] = data[i + 1] = data[i + 2] = v
        data[i + 3] = 255
      }
      ctx.putImageData(image, 0, 0)
    }
    raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [fps, scale])

  return (
    <canvas
      ref={ref}
      style={{ opacity }}
      className={cn("pointer-events-none absolute inset-0 size-full mix-blend-overlay", className)}
      aria-hidden
    />
  )
}
