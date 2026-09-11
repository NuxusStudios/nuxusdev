"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function ImageComparison({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  className,
}: {
  before: React.ReactNode
  after: React.ReactNode
  beforeLabel?: string
  afterLabel?: string
  className?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [position, setPosition] = React.useState(50)
  const dragging = React.useRef(false)

  const move = React.useCallback((clientX: number) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPosition(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)))
  }, [])

  React.useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current) return
      move("touches" in e ? e.touches[0].clientX : e.clientX)
    }
    const stop = () => (dragging.current = false)
    window.addEventListener("mousemove", onMove)
    window.addEventListener("touchmove", onMove)
    window.addEventListener("mouseup", stop)
    window.addEventListener("touchend", stop)
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("mouseup", stop)
      window.removeEventListener("touchend", stop)
    }
  }, [move])

  return (
    <div
      ref={ref}
      onMouseDown={(e) => {
        dragging.current = true
        move(e.clientX)
      }}
      onTouchStart={(e) => {
        dragging.current = true
        move(e.touches[0].clientX)
      }}
      className={cn(
        "relative select-none overflow-hidden rounded-2xl border border-white/10",
        className
      )}
    >
      <div className="absolute inset-0">{after}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {before}
      </div>

      <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white backdrop-blur">
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white backdrop-blur">
        {afterLabel}
      </span>

      <div
        className="absolute inset-y-0 w-px cursor-ew-resize bg-white/80"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/70 text-white backdrop-blur">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 6-6 6 6 6M15 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </div>
  )
}
