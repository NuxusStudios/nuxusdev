"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** The order the drum turns in. A cell steps forward through this ring only. */
export const FLAP_ALPHABET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:-/'"

interface Cell {
  char: string
  prev: string
  /** Bumped on every change so the flap animation remounts and replays. */
  rev: number
}

function seed(length: number): Cell[] {
  return Array.from({ length }, () => ({ char: " ", prev: " ", rev: 0 }))
}

/** Subscribed rather than read once, so a mid-session change is picked up. */
function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)")
      query.addEventListener("change", notify)
      return () => query.removeEventListener("change", notify)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  )
}

/**
 * A split-flap board — the mechanical kind from an old departures hall.
 *
 * The drum only turns one way, so a cell showing Z reaching B goes the long way
 * round through the whole alphabet. That constraint is the entire character of
 * the thing: letters near the start of the ring land quickly and the ones past
 * them keep clattering, which is what makes the board settle unevenly.
 *
 * Each flip is four layers — two static halves showing where the cell is going
 * and coming from, and two hinged halves that actually rotate. Half a tick
 * drops the old top; the other half brings the new bottom up to meet it.
 */
export function SplitFlap({
  value,
  length = value.length,
  /** Milliseconds per flap. The whole board advances on one clock. */
  tickMs = 65,
  className,
  cellClassName,
}: {
  value: string
  length?: number
  tickMs?: number
  className?: string
  cellClassName?: string
}) {
  const calm = usePrefersReducedMotion()
  const [cells, setCells] = React.useState<Cell[]>(() => seed(length))
  const [builtFor, setBuiltFor] = React.useState(length)

  // Pad and clip to the board's width, and drop anything the drum can't show.
  const target = React.useMemo(() => {
    const upper = value.toUpperCase()
    return Array.from({ length }, (_, i) => {
      const char = upper[i] ?? " "
      return FLAP_ALPHABET.includes(char) ? char : " "
    })
  }, [length, value])

  // Resizing the board is a render-time adjustment, not an effect: React
  // restarts this render with the new cells and never commits the stale ones.
  if (builtFor !== length) {
    setBuiltFor(length)
    setCells(seed(length))
  }

  React.useEffect(() => {
    if (calm) return

    const id = window.setInterval(() => {
      setCells((prev) => {
        let moved = false
        const next = prev.map((cell, i) => {
          const want = target[i] ?? " "
          if (cell.char === want) return cell
          moved = true
          const at = FLAP_ALPHABET.indexOf(cell.char)
          const step = FLAP_ALPHABET[(at + 1) % FLAP_ALPHABET.length]!
          return { char: step, prev: cell.char, rev: cell.rev + 1 }
        })
        // Nothing left to turn: hand back the same array so React bails out.
        return moved ? next : prev
      })
    }, Math.max(16, tickMs))

    return () => window.clearInterval(id)
  }, [calm, target, tickMs])

  const half = Math.max(8, tickMs) / 2
  // With motion reduced the board just reads the value; nothing turns.
  const shown = calm ? target.map((char) => ({ char, prev: char, rev: 0 })) : cells

  return (
    <div
      className={cn("flex gap-1 [perspective:600px]", className)}
      role="img"
      aria-label={target.join("").trim()}
    >
      {shown.map((cell, i) => (
        <span
          key={i}
          aria-hidden
          className={cn(
            "relative block h-16 w-11 select-none overflow-hidden rounded-[3px] bg-card font-mono text-3xl font-bold text-foreground",
            "shadow-[inset_0_0_0_1px_var(--color-border)]",
            cellClassName,
          )}
        >
          {/* Static: where the cell is going (top) and coming from (bottom). */}
          <Half side="top" char={cell.char} />
          <Half side="bottom" char={cell.prev} />

          {/* The hinge line, drawn over everything so the seam reads. */}
          <span className="absolute inset-x-0 top-1/2 z-30 h-px -translate-y-1/2 bg-background/80" />

          {cell.rev > 0 ? (
            <React.Fragment key={cell.rev}>
              <Half
                side="top"
                char={cell.prev}
                className="z-20 origin-bottom [animation:flap-fall_var(--half)_cubic-bezier(0.4,0,1,1)_both]"
                style={{ ["--half" as string]: `${half}ms` }}
              />
              <Half
                side="bottom"
                char={cell.char}
                className="z-20 origin-top [animation:flap-rise_var(--half)_cubic-bezier(0,0,0.2,1)_var(--half)_both]"
                style={{ ["--half" as string]: `${half}ms` }}
              />
            </React.Fragment>
          ) : null}
        </span>
      ))}

      <style>{`
        @keyframes flap-fall { from { transform: rotateX(0deg) } to { transform: rotateX(-90deg) } }
        @keyframes flap-rise { from { transform: rotateX(90deg) } to { transform: rotateX(0deg) } }
      `}</style>
    </div>
  )
}

/**
 * One half of a character cell. The glyph inside is always laid out at the
 * cell's full height and then clipped, so both halves share one baseline and
 * the seam lands exactly across the middle of the letter.
 */
function Half({
  side,
  char,
  className,
  style,
}: {
  side: "top" | "bottom"
  char: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <span
      className={cn(
        "absolute inset-x-0 h-1/2 overflow-hidden bg-card",
        side === "top" ? "top-0" : "bottom-0",
        className,
      )}
      style={style}
    >
      <span
        className={cn(
          "absolute inset-x-0 flex h-[200%] items-center justify-center",
          side === "top" ? "top-0" : "bottom-0",
        )}
      >
        {char}
      </span>
    </span>
  )
}
