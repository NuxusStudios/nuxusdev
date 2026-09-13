"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&h=1100&fit=crop&q=80&auto=format"

/** Blur applied to the frosted layer, in CSS pixels at 1x. */
const BLUR_PX = 26
/** Radius of the clear trail, in CSS pixels. */
const RADIUS = 108
/** Per-frame alpha erased from the trail while the pointer is moving. */
const FADE_ACTIVE = 0.018
/** Per-frame alpha erased once the pointer has gone still. */
const FADE_IDLE = 0.075
/** Milliseconds of stillness before the faster fade takes over. */
const IDLE_AFTER = 260

/**
 * An image held behind frosted glass that clears only where the cursor has
 * recently been, and freezes back over as the trail ages.
 *
 * This is a compositing trick rather than a shader. The blurred copy is
 * rendered once at load into an offscreen canvas — blurring a full-bleed image
 * every frame is the one thing that would actually cost something — and each
 * frame then assembles three draws: the sharp image, the trail mask punched
 * through it with `destination-in`, and the cached blur filled in behind with
 * `destination-over`. No pixels are ever read back, so no canvas is tainted and
 * the image may come from any host.
 */
export function FrostReveal({
  src = DEFAULT_IMAGE,
  alt = "",
  radius = RADIUS,
  className,
}: {
  src?: string
  alt?: string
  radius?: number
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

    const mask = document.createElement("canvas")
    const maskCtx = mask.getContext("2d")
    const frosted = document.createElement("canvas")
    const frostedCtx = frosted.getContext("2d")
    if (!maskCtx || !frostedCtx) return

    const calm = window.matchMedia("(prefers-reduced-motion: reduce)")
    let image: HTMLImageElement | null = null
    let dpr = 1
    let width = 0
    let height = 0
    let raf: number | null = null
    let onscreen = true
    let disposed = false

    const pointer = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, inside: false, drawn: false, moved: 0 }

    /** Cover-fit the source into the canvas, the way object-fit: cover would. */
    function coverRect(img: HTMLImageElement) {
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
      const w = img.naturalWidth * scale
      const h = img.naturalHeight * scale
      return { x: (width - w) / 2, y: (height - h) / 2, w, h }
    }

    function measure() {
      const next = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(host!.clientWidth * next))
      const h = Math.max(1, Math.round(host!.clientHeight * next))
      if (w === width && h === height && next === dpr) return false

      dpr = next
      width = w
      height = h
      canvas!.width = w
      canvas!.height = h
      mask.width = w
      mask.height = h
      frosted.width = w
      frosted.height = h
      maskCtx!.clearRect(0, 0, w, h)

      if (image) {
        // Re-render the blur only on a real size change, never per frame.
        const box = coverRect(image)
        frostedCtx!.clearRect(0, 0, w, h)
        frostedCtx!.filter = `blur(${BLUR_PX * dpr}px) brightness(0.82) saturate(0.85)`
        frostedCtx!.drawImage(image, box.x, box.y, box.w, box.h)
        frostedCtx!.filter = "none"
      }
      return true
    }

    function paintTrail(now: number) {
      const idle = now - pointer.moved > IDLE_AFTER
      const alpha = calm.matches ? 0 : idle ? FADE_IDLE : FADE_ACTIVE

      if (alpha > 0) {
        maskCtx!.globalCompositeOperation = "destination-out"
        maskCtx!.fillStyle = `rgba(0,0,0,${alpha})`
        maskCtx!.fillRect(0, 0, width, height)
      }

      if (!pointer.inside) {
        pointer.drawn = false
        return
      }

      const r = radius * dpr
      const x = pointer.x * width
      const y = pointer.y * height

      maskCtx!.globalCompositeOperation = "source-over"

      // Bridge the gap between samples, or a fast flick leaves a dotted line.
      if (pointer.drawn) {
        maskCtx!.strokeStyle = "rgba(255,255,255,0.62)"
        maskCtx!.lineWidth = r * 1.05
        maskCtx!.lineCap = "round"
        maskCtx!.lineJoin = "round"
        maskCtx!.beginPath()
        maskCtx!.moveTo(pointer.prevX * width, pointer.prevY * height)
        maskCtx!.lineTo(x, y)
        maskCtx!.stroke()
      }

      const soft = maskCtx!.createRadialGradient(x, y, r * 0.1, x, y, r * 1.15)
      soft.addColorStop(0, "rgba(255,255,255,1)")
      soft.addColorStop(0.4, "rgba(255,255,255,0.7)")
      soft.addColorStop(1, "rgba(255,255,255,0)")
      maskCtx!.fillStyle = soft
      maskCtx!.beginPath()
      maskCtx!.arc(x, y, r * 1.15, 0, Math.PI * 2)
      maskCtx!.fill()

      pointer.drawn = true
      pointer.prevX = pointer.x
      pointer.prevY = pointer.y
    }

    function compose() {
      if (!image) return
      const box = coverRect(image)

      ctx!.globalCompositeOperation = "source-over"
      ctx!.clearRect(0, 0, width, height)
      ctx!.drawImage(image, box.x, box.y, box.w, box.h)

      // Keep the sharp image only where the trail has been…
      ctx!.globalCompositeOperation = "destination-in"
      ctx!.drawImage(mask, 0, 0)

      // …and fill the frost in behind everything that was just erased.
      ctx!.globalCompositeOperation = "destination-over"
      ctx!.drawImage(frosted, 0, 0)
      ctx!.globalCompositeOperation = "source-over"
    }

    function frame(now: number) {
      raf = null
      if (disposed) return
      measure()
      paintTrail(now)
      compose()
      if (onscreen && !document.hidden) raf = requestAnimationFrame(frame)
    }

    function wake() {
      if (raf === null && onscreen && !document.hidden && !disposed) {
        raf = requestAnimationFrame(frame)
      }
    }

    function sleep() {
      if (raf !== null) {
        cancelAnimationFrame(raf)
        raf = null
      }
    }

    function track(event: PointerEvent) {
      const rect = canvas!.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1
      if (!inside) {
        pointer.inside = false
        return
      }
      if (!pointer.inside) {
        // Entering: start the segment here rather than from the last exit point.
        pointer.prevX = x
        pointer.prevY = y
        pointer.drawn = false
      }
      pointer.inside = true
      pointer.x = x
      pointer.y = y
      pointer.moved = performance.now()
      // Reduced motion runs no loop, so each move has to paint itself.
      if (calm.matches) {
        measure()
        paintTrail(performance.now())
        compose()
      }
    }

    function leave() {
      pointer.inside = false
      pointer.drawn = false
    }

    const observer = new ResizeObserver(() => {
      if (measure() && calm.matches) compose()
    })
    observer.observe(host)

    const visibility = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) onscreen = entry.isIntersecting
        if (calm.matches) return
        if (onscreen) wake()
        else sleep()
      },
      { rootMargin: "192px" },
    )
    visibility.observe(host)

    const onVisibility = () => {
      if (calm.matches) return
      if (document.hidden) sleep()
      else wake()
    }

    const loaded = new Image()
    loaded.crossOrigin = "anonymous"
    loaded.decoding = "async"
    loaded.onload = () => {
      if (disposed) return
      image = loaded
      dpr = 0 // force measure() to rebuild the frosted layer
      measure()
      compose()
      if (!calm.matches) wake()
    }
    loaded.src = src

    window.addEventListener("pointermove", track, { passive: true })
    host.addEventListener("pointerleave", leave)
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      disposed = true
      sleep()
      observer.disconnect()
      visibility.disconnect()
      window.removeEventListener("pointermove", track)
      host.removeEventListener("pointerleave", leave)
      document.removeEventListener("visibilitychange", onVisibility)
      loaded.onload = null
    }
  }, [radius, src])

  return (
    <div ref={hostRef} className={cn("relative h-full w-full overflow-hidden bg-background", className)}>
      <canvas ref={canvasRef} aria-hidden className="block h-full w-full" />
      {alt ? <span className="sr-only">{alt}</span> : null}
    </div>
  )
}
