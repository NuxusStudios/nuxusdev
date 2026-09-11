"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HoverRevealRow {
  name: string
  meta?: string
  detail: string
  image: string
}

function img(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=620&h=760&fit=crop&q=70&auto=format`
}

const DEFAULT_ROWS: HoverRevealRow[] = [
  { name: "Aurora UI", meta: "Next.js", detail: "Motion design, page transitions, interface systems", image: img("1506744038136-46273834b3fb") },
  { name: "Neon Flow", meta: "React", detail: "Interactive UI, scroll animation, effects library", image: img("1441974231531-c6227db76b6e") },
  { name: "Glassmorph", meta: "Next.js", detail: "Glass surfaces, components, motion architecture", image: img("1470071459604-3b5ec3a7fe05") },
  { name: "Void System", meta: "WebGL", detail: "Shaders, creative development, visual effects", image: img("1500530855697-b586d89ba3ee") },
  { name: "Kinetic Lab", meta: "Three.js", detail: "3D interfaces, motion UI, immersive experiences", image: img("1418065460487-3e41a6c84dc5") },
  { name: "Pixel Grid", meta: "Tailwind", detail: "Design systems, UI engineering, responsive layout", image: img("1433086966358-54859d0ed716") },
  { name: "Motion Core", meta: "Headless CMS", detail: "Reusable components, motion engine, performance", image: img("1501785888041-af3ef285b470") },
]

/**
 * A list where hovering a row reveals its image behind the type.
 *
 * The image sits under `mix-blend-mode: difference`, so the row's text inverts
 * itself against whatever is behind it rather than needing a colour swap — one
 * blend mode instead of a tween per cell.
 *
 * The reveal is a clip-path wipe and the pointer drift is a single rAF lerp
 * writing one transform, so nothing here needs an animation library.
 */
export function HoverRevealList({
  rows = DEFAULT_ROWS,
  className,
}: {
  rows?: HoverRevealRow[]
  className?: string
}) {
  const [active, setActive] = React.useState<number | null>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const layerRef = React.useRef<HTMLDivElement>(null)
  const barRef = React.useRef<HTMLDivElement>(null)

  const target = React.useRef({ x: 0, y: 0 })
  const shown = React.useRef({ x: 0, y: 0 })
  const reduced = useReducedMotion()
  const coarse = useCoarsePointer()

  React.useEffect(() => {
    if (reduced || coarse) return

    let frame = 0
    const tick = () => {
      const layer = layerRef.current
      if (layer) {
        // ease toward the pointer rather than tracking it exactly, so the
        // image trails the cursor instead of sticking to it
        shown.current.x += (target.current.x - shown.current.x) * 0.12
        shown.current.y += (target.current.y - shown.current.y) * 0.12
        layer.style.transform = `translate3d(${shown.current.x}px, ${shown.current.y}px, 0)`
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduced, coarse])

  function onMove(event: React.MouseEvent<HTMLDivElement>) {
    if (reduced || coarse) return
    const bounds = event.currentTarget.getBoundingClientRect()
    target.current = {
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 22,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 22,
    }
  }

  function onRowEnter(index: number, row: HTMLElement) {
    setActive(index)

    const list = listRef.current
    const bar = barRef.current
    if (!list || !bar) return

    const listBox = list.getBoundingClientRect()
    const rowBox = row.getBoundingClientRect()
    bar.style.transform = `translateY(${rowBox.top - listBox.top}px)`
    bar.style.height = `${rowBox.height}px`
    bar.style.opacity = "1"
  }

  function onLeave() {
    setActive(null)
    if (barRef.current) barRef.current.style.opacity = "0"
    target.current = { x: 0, y: 0 }
  }

  // a touch device has no hover, so the images belong inline
  if (coarse) {
    return (
      <div className={cn("w-full bg-card font-mono text-foreground", className)}>
        {rows.map((row) => (
          <div key={row.name} className="flex border-b border-border last:border-0">
            <div className="flex w-1/2 flex-col gap-1 p-4">
              <p className="text-sm font-bold uppercase tracking-widest">{row.name}</p>
              {row.meta && (
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{row.meta}</p>
              )}
              <p className="text-xs leading-relaxed text-muted-foreground">{row.detail}</p>
            </div>
            <div className="relative aspect-3/4 w-1/2">
              <img src={row.image} alt="" aria-hidden loading="lazy" className="absolute inset-0 size-full object-cover" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn("relative w-full overflow-hidden bg-card font-mono text-foreground", className)}
      onMouseMove={onMove}
    >
      <div
        ref={barRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-foreground opacity-0 transition-[transform,height,opacity] duration-300 ease-out motion-reduce:transition-none"
      />

      <div ref={layerRef} aria-hidden className="pointer-events-none absolute inset-0 z-20 mix-blend-difference">
        {rows.map((row, index) => (
          <div
            key={row.name}
            className={cn(
              "absolute left-[36%] top-1/2 -translate-y-1/2 overflow-hidden",
              "h-[clamp(180px,34vw,360px)] w-[clamp(150px,28vw,300px)]",
              "transition-[clip-path,opacity] duration-500 ease-out motion-reduce:transition-opacity",
              active === index ? "opacity-100 [clip-path:inset(0%)]" : "opacity-0 [clip-path:inset(50%)]"
            )}
          >
            <img src={row.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
          </div>
        ))}
      </div>

      <div ref={listRef} className="relative z-30" onMouseLeave={onLeave}>
        {rows.map((row, index) => (
          <div
            key={row.name}
            onMouseEnter={(event) => onRowEnter(index, event.currentTarget)}
            className="grid cursor-default grid-cols-[1fr_1fr_2fr] items-center gap-4 px-6 py-3 text-xs uppercase tracking-widest"
          >
            <span className="truncate">{row.name}</span>
            <span className="truncate">{row.meta}</span>
            <span className="truncate">{row.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function useReducedMotion(): boolean {
  return useMedia("(prefers-reduced-motion: reduce)")
}

function useCoarsePointer(): boolean {
  return useMedia("(pointer: coarse)")
}

function useMedia(query: string): boolean {
  return React.useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query)
      media.addEventListener("change", callback)
      return () => media.removeEventListener("change", callback)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

export default HoverRevealList
