"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Deterministic stand-in peaks. Real peaks come from decoding the audio; this
 * exists so a demo renders the same on the server and the client — seeding a
 * waveform with Math.random is a hydration mismatch waiting to happen.
 */
export function makePeaks(count = 160, seed = 7): number[] {
  let state = seed
  const next = () => {
    state = (state * 1664525 + 1013904223) % 4294967296
    return state / 4294967296
  }
  return Array.from({ length: count }, (_, i) => {
    const arc = Math.sin((i / count) * Math.PI) // quiet at both ends
    const beat = 0.55 + 0.45 * Math.abs(Math.sin(i * 0.42))
    return Math.min(1, Math.max(0.06, arc * beat * (0.62 + next() * 0.5)))
  })
}

function clock(seconds: number) {
  const total = Math.max(0, Math.round(seconds))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

/**
 * A waveform seek bar. It owns no audio and no timer — position comes in, seeks
 * go out, so it sits equally well on an <audio> element, a media session, or a
 * transport you wrote yourself.
 *
 * Bars are elements rather than a canvas drawing. A canvas would have to be
 * handed real colours, and the theme here is a set of CSS custom properties
 * that may be `oklch()` — which canvas is not obliged to parse. Leaving the
 * bars in the DOM lets the played and unplayed halves be ordinary classes, and
 * the whole control re-themes for free.
 */
export function WaveformScrubber({
  peaks,
  duration,
  position,
  onSeek,
  /** Seconds an arrow key moves. Shift multiplies it by five. */
  step = 5,
  label = "Seek",
  className,
}: {
  peaks: number[]
  duration: number
  position: number
  onSeek: (seconds: number) => void
  step?: number
  label?: string
  className?: string
}) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [hover, setHover] = React.useState<number | null>(null)
  const [scrubbing, setScrubbing] = React.useState(false)

  const played = duration > 0 ? Math.min(1, Math.max(0, position / duration)) : 0

  const ratioAt = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0) return 0
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const scale = event.shiftKey ? 5 : 1
    const moves: Record<string, number> = {
      ArrowLeft: -step * scale,
      ArrowRight: step * scale,
      ArrowDown: -step * scale,
      ArrowUp: step * scale,
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      onSeek(event.key === "Home" ? 0 : duration)
      return
    }
    const delta = moves[event.key]
    if (delta === undefined) return
    event.preventDefault()
    onSeek(Math.min(duration, Math.max(0, position + delta)))
  }

  // The hover readout shows where a click would land; once scrubbing, it is
  // the live position instead, so the chip never lags behind the finger.
  const preview = scrubbing ? played : hover

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${clock(position)} of ${clock(duration)}`}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          setScrubbing(true)
          onSeek(ratioAt(event.clientX) * duration)
        }}
        onPointerMove={(event) => {
          const ratio = ratioAt(event.clientX)
          setHover(ratio)
          if (scrubbing) onSeek(ratio * duration)
        }}
        onPointerUp={() => setScrubbing(false)}
        onPointerCancel={() => setScrubbing(false)}
        onPointerLeave={() => setHover(null)}
        className={cn(
          "relative flex h-20 w-full touch-none items-center gap-px rounded-lg px-0.5",
          "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary",
        )}
      >
        {peaks.map((peak, i) => {
          const at = peaks.length > 1 ? i / (peaks.length - 1) : 0
          const done = at <= played
          const under = preview !== null && at <= preview && !done
          return (
            <span
              key={i}
              aria-hidden
              className={cn(
                "min-w-px flex-1 rounded-full transition-colors duration-150",
                done ? "bg-primary" : under ? "bg-foreground/40" : "bg-foreground/15",
              )}
              style={{ height: `${Math.round(peak * 100)}%` }}
            />
          )
        })}

        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-primary transition-[left] duration-75"
          style={{ left: `${played * 100}%` }}
        />

        {hover !== null && !scrubbing ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[0.6rem] font-medium tabular-nums text-background"
            style={{ left: `${hover * 100}%` }}
          >
            {clock(hover * duration)}
          </span>
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between px-0.5 font-mono text-[0.7rem] tabular-nums text-muted-foreground">
        <span>{clock(position)}</span>
        <span>−{clock(Math.max(0, duration - position))}</span>
      </div>
    </div>
  )
}
