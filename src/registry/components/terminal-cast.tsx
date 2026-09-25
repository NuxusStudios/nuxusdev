"use client"

import * as React from "react"
import { RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CastLine {
  kind: "cmd" | "out" | "ok" | "note"
  text: string
  /** Milliseconds to hold before the next line. Ignored for commands. */
  pause?: number
}

export const CAST_SESSION: CastLine[] = [
  { kind: "cmd", text: "npx nuxus add halo-button" },
  { kind: "out", text: "Resolving halo-button from the registry", pause: 420 },
  { kind: "out", text: "Checking peer dependencies  lucide-react ✓  tailwindcss ✓", pause: 320 },
  { kind: "ok", text: "Wrote components/ui/halo-button.tsx", pause: 260 },
  { kind: "note", text: "No runtime dependency added. The file is yours.", pause: 900 },
  { kind: "cmd", text: "npx nuxus theme --mine" },
  { kind: "out", text: "Reading tokens from app/globals.css", pause: 380 },
  { kind: "ok", text: "12 components re-rendered in your palette", pause: 1400 },
]

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
 * A terminal replaying a recorded session, one keystroke at a time.
 *
 * The replay is a chain of timeouts rather than an interval: a command types at
 * one cadence, output lands at another, and a pause after a result is part of
 * what makes it read as a session instead of a ticker. An interval can only
 * offer one speed, so each step schedules the next with its own delay.
 *
 * Keystroke timing is derived from the character being typed, not from a random
 * number. It still lands unevenly enough to read as typing, and it replays the
 * same way twice — which is the difference between a demo and a coin toss.
 *
 * Reduced motion is not a slower replay. It renders the finished transcript and
 * never schedules anything, because the point of the setting is that nothing
 * moves.
 */
export function TerminalCast({
  session = CAST_SESSION,
  title = "zsh — nuxus",
  className,
}: {
  session?: CastLine[]
  title?: string
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  const [shown, setShown] = React.useState<CastLine[]>([])
  const [typing, setTyping] = React.useState("")
  const [done, setDone] = React.useState(false)
  const [run, setRun] = React.useState(0)
  const bodyRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (reduced) return

    let line = 0
    let ch = 0
    let timer = 0

    const advance = () => {
      const current = session[line]
      if (!current) {
        setDone(true)
        return
      }

      if (current.kind === "cmd" && ch < current.text.length) {
        ch += 1
        setTyping(current.text.slice(0, ch))
        // A wobble taken from the character itself: uneven, and the same on
        // every replay.
        const jitter = (current.text.charCodeAt(ch - 1) % 5) * 11
        timer = window.setTimeout(advance, 24 + jitter)
        return
      }

      setShown((prev) => [...prev, current])
      setTyping("")
      line += 1
      ch = 0
      timer = window.setTimeout(advance, current.kind === "cmd" ? 300 : (current.pause ?? 160))
    }

    timer = window.setTimeout(advance, 500)
    return () => window.clearTimeout(timer)
  }, [reduced, run, session])

  React.useEffect(() => {
    const body = bodyRef.current
    if (body) body.scrollTop = body.scrollHeight
  }, [shown, typing])

  const lines = reduced ? session : shown
  const finished = reduced || done

  return (
    <section className={cn("w-full bg-background px-4 py-20 text-foreground md:px-6", className)}>
      <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-border bg-card shadow-[0_30px_70px_-40px_rgb(0_0_0/0.9)]">
        <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/20" />
            <span className="size-2.5 rounded-full bg-foreground/20" />
          </span>
          <span className="flex-1 text-center font-mono text-[0.7rem] text-muted-foreground">{title}</span>
          <button
            type="button"
            onClick={() => {
              setShown([])
              setTyping("")
              setDone(false)
              setRun((n) => n + 1)
            }}
            disabled={reduced}
            aria-label="Replay the session"
            className={cn(
              "rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <RotateCcw aria-hidden className="size-3.5" />
          </button>
        </div>

        <div
          ref={bodyRef}
          // aria-live would re-announce the whole transcript on every keystroke.
          // The finished text is in the DOM either way, so let it be read there.
          aria-live="off"
          className="h-72 overflow-y-auto p-4 font-mono text-[0.78rem] leading-relaxed"
        >
          {lines.map((entry, i) => (
            <p key={`${run}-${i}`} className={cn("flex gap-2", i > 0 && "mt-1")}>
              <Glyph kind={entry.kind} />
              <span className={toneOf(entry.kind)}>{entry.text}</span>
            </p>
          ))}

          {typing ? (
            <p className={cn("flex gap-2", lines.length > 0 && "mt-1")}>
              <Glyph kind="cmd" />
              <span>
                {typing}
                <span aria-hidden className="ml-px inline-block h-[1em] w-[0.5em] translate-y-[0.15em] bg-primary" />
              </span>
            </p>
          ) : null}

          {finished ? (
            <p className={cn("flex gap-2", lines.length > 0 && "mt-1")}>
              <Glyph kind="cmd" />
              <span
                aria-hidden
                className="ml-px inline-block h-[1em] w-[0.5em] translate-y-[0.15em] animate-pulse bg-primary motion-reduce:animate-none"
              />
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function Glyph({ kind }: { kind: CastLine["kind"] }) {
  if (kind === "cmd") return <span aria-hidden className="shrink-0 text-primary">$</span>
  if (kind === "ok") return <span aria-hidden className="shrink-0 text-primary">✓</span>
  return <span aria-hidden className="shrink-0 text-transparent">·</span>
}

function toneOf(kind: CastLine["kind"]) {
  if (kind === "out") return "text-muted-foreground"
  if (kind === "note") return "italic text-muted-foreground/70"
  return undefined
}
