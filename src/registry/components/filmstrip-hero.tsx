"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FilmstripItem {
  id?: string | number
  /** Headline for the focused slide. Newlines become separate wipe lines. */
  title: string
  image: string
  alt?: string
  /** Byline printed beside the headline. */
  credit?: string
  /** Right-aligned facts, e.g. ["FRI 14 NOV", "19:00", "ROTTERDAM"]. */
  meta?: string[]
  /** Colour the backdrop is graded to while this item is focused. */
  accent?: string
}

function shot(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=720&h=960&fit=crop&q=74&auto=format`
}

export const FILMSTRIP_ITEMS: FilmstripItem[] = [
  { title: "Low\nCountry", image: shot("1470071459604-3b5ec3a7fe05"), alt: "Fog in a forested valley", credit: "STUDIO HALDEN.", meta: ["FRI 14 NOV", "19:00", "ROTTERDAM"], accent: "#3f6d8c" },
  { title: "Hard\nLight", image: shot("1418065460487-3e41a6c84dc5"), alt: "Bare hills under a hard sky", credit: "ATELIER RUE NEUVE.", meta: ["SAT 15 NOV", "14:00", "MARSEILLE"], accent: "#c2683a" },
  { title: "Understory", image: shot("1441974231531-c6227db76b6e"), alt: "Light through a stand of trees", credit: "MAISON VERT.", meta: ["SUN 16 NOV", "11:00", "GHENT"], accent: "#4f7a4a" },
  { title: "Third\nRail", image: shot("1500530855697-b586d89ba3ee"), alt: "A road running into open country", credit: "NORTE COLLECTIVE.", meta: ["WED 19 NOV", "21:00", "LISBON"], accent: "#8a5ec4" },
  { title: "Still\nWater", image: shot("1506744038136-46273834b3fb"), alt: "Still water beneath a ridgeline", credit: "STUDIO HALDEN.", meta: ["THU 20 NOV", "18:30", "OSLO"], accent: "#2f5fa8" },
  { title: "Undertow", image: shot("1433086966358-54859d0ed716"), alt: "A waterfall beneath a stone bridge", credit: "CASA SOLARA.", meta: ["SAT 22 NOV", "16:00", "PORTO"], accent: "#1f7f82" },
  { title: "Open\nPalm", image: shot("1501785888041-af3ef285b470"), alt: "A mountain lake mirroring the sky", credit: "NOIR ET CIE.", meta: ["SUN 23 NOV", "20:00", "TURIN"], accent: "#b8407a" },
]

/* Every size below is a ratio of the measured stage, so the component is the
   same picture in a 600px preview box and on a 4K display. */
const CARD_H = 0.27 // focused card height ÷ stage height
const CARD_AR = 0.74 // focused card is roughly 3:4
const GAP = 0.04 // gap ÷ card width
const STRIP_TOP = 0.5 // the strip's shared top edge, down the stage
const TITLE = 0.068
const LABEL = 0.011
const PAD = 0.018
const RAIL = 0.2

const WHEEL_STEP = 60
const WHEEL_LOCKOUT = 420
/** Pointer travel, in px, before a press is treated as a drag rather than a tap. */
const DRAG_SLOP = 4
/** Below this, the settle is close enough to done to stop the frame loop. */
const SETTLED_PX = 0.4

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

/**
 * A full-bleed editorial hero driven by a filmstrip.
 *
 * Every card shares one top edge. The focused card unfurls to full height while
 * its neighbours stay clipped to half, so the strip reads as a row of cropped
 * heads with one complete portrait standing in the middle of it. Changing focus
 * re-grades the entire backdrop to that card's accent.
 *
 * The track is driven by a ref-held motion value settled in rAF rather than by
 * a CSS transition, because a drag that starts mid-settle has to pick up the
 * real position — not where the transition was headed. Reading the transition's
 * destination instead snaps the card out from under the finger.
 */
export function FilmstripHero({
  items = FILMSTRIP_ITEMS,
  defaultIndex = 2,
  onIndexChange,
  brand,
  autoplay = false,
  autoplayMs = 4200,
  className,
}: {
  items?: FilmstripItem[]
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  brand?: React.ReactNode
  autoplay?: boolean
  autoplayMs?: number
  className?: string
}) {
  const stageRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ w: 0, h: 0 })
  const [index, setIndex] = React.useState(defaultIndex)
  const [dragging, setDragging] = React.useState(false)
  const [paused, setPaused] = React.useState(false)

  const last = items.length - 1
  const current = clamp(index, 0, Math.max(0, last))

  const go = React.useCallback(
    (next: number) => {
      const wanted = clamp(next, 0, Math.max(0, last))
      setIndex((prev) => {
        if (prev !== wanted) onIndexChange?.(wanted)
        return wanted
      })
    },
    [last, onIndexChange],
  )

  // One observer feeds every measurement in the component.
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const read = () =>
      setBox((prev) => {
        const w = stage.clientWidth
        const h = stage.clientHeight
        return prev.w === w && prev.h === h ? prev : { w, h }
      })
    read()
    const observer = new ResizeObserver(read)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const fullH = clamp(box.h * CARD_H, 96, 360)
  const halfH = fullH / 2
  const cardW = fullH * CARD_AR
  const gap = Math.max(4, Math.round(cardW * GAP))
  const step = cardW + gap
  const pad = Math.max(16, Math.round(box.w * PAD))
  const label = Math.max(9, Math.round(box.h * LABEL))

  /** Where the track must sit for card `i` to be centred in the stage. */
  const xFor = React.useCallback(
    (i: number) => box.w / 2 - (i * step + cardW / 2),
    [box.w, step, cardW],
  )

  const x = React.useRef(0)
  const raf = React.useRef<number | null>(null)
  const target = xFor(current)

  const write = React.useCallback((value: number) => {
    x.current = value
    const track = trackRef.current
    if (track) track.style.transform = `translate3d(${value}px, 0, 0)`
  }, [])

  // Critically-damped settle toward the target, in a loop that stops itself.
  React.useEffect(() => {
    if (dragging || box.w === 0) return
    const step0 = () => {
      const delta = target - x.current
      if (Math.abs(delta) < SETTLED_PX) {
        write(target)
        raf.current = null
        return
      }
      write(x.current + delta * 0.16)
      raf.current = requestAnimationFrame(step0)
    }
    if (raf.current === null) raf.current = requestAnimationFrame(step0)
    return () => {
      if (raf.current !== null) {
        cancelAnimationFrame(raf.current)
        raf.current = null
      }
    }
  }, [target, dragging, box.w, write])

  // Wheel and trackpad. Once the strip is against an end the gesture is handed
  // back to the page — without that, a full-height carousel is a scroll trap.
  React.useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    let acc = 0
    let until = 0

    const onWheel = (event: WheelEvent) => {
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      const stuck = (delta > 0 && current === last) || (delta < 0 && current === 0)
      if (stuck) {
        acc = 0
        return
      }
      event.preventDefault()
      if (event.timeStamp < until) return
      acc += delta
      if (Math.abs(acc) < WHEEL_STEP) return
      go(current + Math.sign(acc))
      acc = 0
      until = event.timeStamp + WHEEL_LOCKOUT
    }

    stage.addEventListener("wheel", onWheel, { passive: false })
    return () => stage.removeEventListener("wheel", onWheel)
  }, [current, go, last])

  React.useEffect(() => {
    if (!autoplay || paused || dragging || items.length < 2) return
    const id = window.setTimeout(() => go(current === last ? 0 : current + 1), autoplayMs)
    return () => window.clearTimeout(id)
  }, [autoplay, autoplayMs, current, dragging, go, items.length, last, paused])

  const drag = React.useRef({ startX: 0, startTrack: 0, moved: 0, time: 0, captured: false })

  const active = items[current]
  if (!active) return null

  const lines = active.title.split("\n")
  const accent = active.accent ?? "#6b7280"

  return (
    <div
      ref={stageRef}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="Featured dates"
      onKeyDown={(event) => {
        const moves: Record<string, number> = {
          ArrowLeft: current - 1,
          ArrowRight: current + 1,
          Home: 0,
          End: last,
        }
        if (!(event.key in moves)) return
        event.preventDefault()
        go(moves[event.key]!)
      }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "relative h-full min-h-[26rem] w-full select-none overflow-hidden bg-background text-white",
        "outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-white/40",
        className,
      )}
    >
      {/* Backdrop: the focused photo, blown up, keeping its luminance but
          taking the accent's hue. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {items.map((item, i) => (
          <img
            key={item.id ?? item.image}
            src={item.image}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full scale-125 object-cover transition-opacity duration-700"
            style={{ opacity: i === current ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 transition-colors duration-700" style={{ backgroundColor: accent, mixBlendMode: "color" }} />
        <div className="absolute inset-0 opacity-45 transition-colors duration-700" style={{ backgroundColor: accent, mixBlendMode: "multiply" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/50" />
      </div>

      {brand ? (
        <div
          className="absolute inset-x-0 flex justify-center font-semibold tracking-[0.06em]"
          style={{ top: Math.max(16, box.h * 0.03), fontSize: label * 1.35 }}
        >
          {brand}
        </div>
      ) : null}

      {/* Headline block, sitting just above the strip's shared top edge. */}
      <div
        className="absolute inset-x-0 top-0 flex flex-col justify-end"
        style={{
          height: `${STRIP_TOP * 100}%`,
          paddingLeft: pad,
          paddingRight: pad,
          paddingBottom: Math.round(box.h * 0.03),
        }}
      >
        <div key={current} className="flex w-full flex-wrap items-end gap-x-[6vw] gap-y-2">
          <h2
            className="font-semibold leading-[0.88] tracking-[-0.03em]"
            style={{ fontSize: Math.max(24, Math.round(box.h * TITLE)) }}
          >
            {lines.map((line, i) => (
              // Each line wipes up from behind its own edge.
              <span key={line + String(i)} className="block overflow-hidden">
                <span
                  className="block [animation:filmstrip-wipe_620ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:[animation:none]"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          {active.credit ? (
            <p
              className="font-mono uppercase tracking-[0.14em] opacity-80 [animation:filmstrip-fade_520ms_ease_100ms_both] motion-reduce:[animation:none]"
              style={{ fontSize: label }}
            >
              {active.credit}
            </p>
          ) : null}

          {active.meta?.length ? (
            <div className="ml-auto flex items-end" style={{ gap: `${Math.max(16, box.w * 0.055)}px` }}>
              {active.meta.map((fact, i) => (
                <span
                  key={fact}
                  className="whitespace-nowrap font-mono uppercase tracking-[0.14em] opacity-80 [animation:filmstrip-fade_460ms_ease_both] motion-reduce:[animation:none]"
                  style={{ fontSize: label, animationDelay: `${120 + i * 60}ms` }}
                >
                  {fact}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* The strip: one shared top edge, the focused card twice as tall. */}
      <div className="absolute inset-x-0" style={{ top: `${STRIP_TOP * 100}%`, height: fullH }}>
        <div
          ref={trackRef}
          className="flex items-start will-change-transform"
          style={{ gap, cursor: dragging ? "grabbing" : "grab" }}
          onPointerDown={(event) => {
            drag.current = {
              startX: event.clientX,
              startTrack: x.current,
              moved: 0,
              time: event.timeStamp,
              captured: false,
            }
            setDragging(true)
          }}
          onPointerMove={(event) => {
            if (!dragging) return
            const moved = event.clientX - drag.current.startX
            drag.current.moved = moved
            // Capture only once this is unmistakably a drag. Capturing on
            // pointerdown would retarget every event to this element, and the
            // click would then land here instead of on the card that was hit.
            if (!drag.current.captured && Math.abs(moved) > DRAG_SLOP) {
              event.currentTarget.setPointerCapture(event.pointerId)
              drag.current.captured = true
            }
            if (drag.current.captured) {
              write(clamp(drag.current.startTrack + moved, xFor(last) - step / 2, xFor(0) + step / 2))
            }
          }}
          onPointerUp={(event) => {
            if (!dragging) return
            setDragging(false)
            // A tap never captured, so leave it to the card's own click.
            if (!drag.current.captured) return
            // Nudge the landing by throw speed so a flick clears more than one card.
            const elapsed = Math.max(1, event.timeStamp - drag.current.time)
            const velocity = (drag.current.moved / elapsed) * 1000
            const thrown = x.current + velocity * 0.12
            go(Math.round((box.w / 2 - thrown - cardW / 2) / step))
          }}
          onPointerCancel={() => setDragging(false)}
        >
          {items.map((item, i) => (
            <button
              key={item.id ?? item.image}
              type="button"
              aria-label={item.title.replace(/\n/g, " ")}
              aria-current={i === current}
              onClick={() => {
                if (drag.current.captured) return
                go(i)
              }}
              className={cn(
                "relative shrink-0 overflow-hidden bg-white/5",
                "transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white",
              )}
              style={{ width: cardW, height: i === current ? fullH : halfH }}
            >
              {/* The focused card is already 3:4, so object-position only decides
                  which band of the portrait the clipped neighbours keep. Anchored
                  above centre so a half card still shows a face, not a forehead. */}
              <img
                src={item.image}
                alt={item.alt ?? ""}
                loading="eager"
                draggable={false}
                className="h-full w-full object-cover"
                style={{ objectPosition: "50% 26%" }}
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-black transition-opacity duration-500"
                style={{ opacity: i === current ? 0 : 0.14 }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Position rail */}
      <div className="absolute" style={{ left: pad, bottom: Math.max(14, box.h * 0.024), width: box.w * RAIL }}>
        <div className="flex justify-between font-mono tabular-nums opacity-80" style={{ fontSize: label }}>
          <span>{String(current + 1).padStart(2, "0")}</span>
          <span>{String(items.length).padStart(2, "0")}</span>
        </div>
        <div className="relative mt-2 h-px w-full bg-white/25">
          <div
            className="absolute inset-y-0 bg-white transition-[left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${100 / items.length}%`, left: `${(current / items.length) * 100}%` }}
          />
        </div>
      </div>

      <style>{`
        @keyframes filmstrip-wipe { from { transform: translateY(110%) } to { transform: translateY(0) } }
        @keyframes filmstrip-fade { from { opacity: 0; transform: translateY(6px) } to { opacity: 0.8; transform: translateY(0) } }
      `}</style>
    </div>
  )
}
