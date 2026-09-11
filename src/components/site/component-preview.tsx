"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Renders a registry demo inside an isolated iframe so a component's own CSS,
 * fonts and animations can't leak into the page around it.
 *
 * The iframe is laid out at `frameWidth` and scaled down to whatever space the
 * card gives it, which keeps every preview at a consistent "desktop" breakpoint.
 * It only mounts once it scrolls into view.
 */
export function ComponentPreview({
  previewKey,
  frameWidth = 1200,
  aspect = 4 / 3,
  className,
  interactive = false,
  eager = false,
}: {
  previewKey: string
  frameWidth?: number
  aspect?: number
  className?: string
  interactive?: boolean
  eager?: boolean
}) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  const [visible, setVisible] = React.useState(eager)
  const [loaded, setLoaded] = React.useState(false)

  React.useEffect(() => {
    const el = hostRef.current
    if (!el) return

    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)

    if (visible) return () => ro.disconnect()

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: "400px" }
    )
    io.observe(el)

    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [visible])

  const scale = width ? width / frameWidth : 0
  const frameHeight = Math.round(frameWidth / aspect)

  return (
    <div
      ref={hostRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
      style={{ aspectRatio: String(aspect) }}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary/60 to-secondary/20" />
      )}

      {visible && scale > 0 && (
        <iframe
          src={`/preview/${previewKey}`}
          title={`${previewKey} preview`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          scrolling="no"
          tabIndex={interactive ? 0 : -1}
          className={cn(
            "absolute left-0 top-0 origin-top-left border-0 bg-background transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            !interactive && "pointer-events-none"
          )}
          style={{
            width: frameWidth,
            height: frameHeight,
            transform: `scale(${scale})`,
          }}
        />
      )}
    </div>
  )
}
