"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type Phase = "idle" | "pending" | "success" | "error"

export interface AsyncButtonProps extends Omit<React.ComponentProps<"button">, "onClick"> {
  /** Runs on click. Resolving shows success; throwing shows the error label. */
  action: () => Promise<unknown>
  label?: string
  pendingLabel?: string
  successLabel?: string
  errorLabel?: string
  /** Milliseconds the result is held before returning to idle. 0 keeps it. */
  resetMs?: number
}

/**
 * A submit button that owns the whole round trip: idle, pending, and whichever
 * of success or failure comes back.
 *
 * Every label is rendered into the same grid cell, so the button is always as
 * wide as its longest state and never resizes mid-flight. A button that shrinks
 * the instant you press it is a target moving out from under the pointer — and
 * on a form it drags the layout beneath it around too.
 *
 * The tick is drawn rather than faded in: `pathLength="1"` turns the dash into
 * a fraction of the stroke, so the same two keyframes work at any size.
 */
export function AsyncButton({
  action,
  label = "Save changes",
  pendingLabel = "Saving",
  successLabel = "Saved",
  errorLabel = "Try again",
  resetMs = 1800,
  className,
  disabled,
  ...props
}: AsyncButtonProps) {
  const [phase, setPhase] = React.useState<Phase>("idle")
  const alive = React.useRef(true)

  React.useEffect(() => {
    // Set on the way in, not just cleared on the way out. Strict Mode mounts,
    // cleans up, then mounts again — without re-arming here the flag stays
    // false for the rest of the component's life and every result is dropped.
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  React.useEffect(() => {
    if (resetMs <= 0) return
    if (phase !== "success" && phase !== "error") return
    const id = window.setTimeout(() => setPhase("idle"), resetMs)
    return () => window.clearTimeout(id)
  }, [phase, resetMs])

  const run = async () => {
    if (phase === "pending") return
    setPhase("pending")
    try {
      await action()
      // The click may outlive the button; don't set state on a dead component.
      if (alive.current) setPhase("success")
    } catch {
      if (alive.current) setPhase("error")
    }
  }

  const states: { key: Phase; text: string }[] = [
    { key: "idle", text: label },
    { key: "pending", text: pendingLabel },
    { key: "success", text: successLabel },
    { key: "error", text: errorLabel },
  ]

  return (
    <>
      <button
        type="button"
        onClick={run}
        disabled={disabled || phase === "pending"}
        data-phase={phase}
        aria-busy={phase === "pending"}
        className={cn(
          "relative inline-grid place-items-center overflow-hidden rounded-full px-6 py-2.5 text-sm font-semibold",
          "bg-primary text-primary-foreground",
          "transition-[background-color,transform,opacity] duration-200",
          "hover:enabled:scale-[1.02] active:enabled:scale-100 disabled:cursor-not-allowed",
          phase === "error" && "bg-destructive text-white [animation:async-shake_400ms_ease]",
          phase === "pending" && "opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        {...props}
      >
        {states.map((state) => (
          <span
            key={state.key}
            aria-hidden={state.key !== phase}
            className={cn(
              // Every label shares one grid cell, so the widest sets the width.
              "col-start-1 row-start-1 flex items-center gap-2 whitespace-nowrap",
              "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              state.key === phase
                ? "opacity-100 [transform:none]"
                : "pointer-events-none opacity-0 [transform:translateY(-140%)]",
            )}
          >
            {state.key === "pending" ? <Spinner /> : null}
            {state.key === "success" ? <Tick /> : null}
            {state.text}
          </span>
        ))}
      </button>

      {/* Announced without stealing focus from wherever the user has gone next. */}
      <span aria-live="polite" className="sr-only">
        {phase === "pending" ? pendingLabel : phase === "success" ? successLabel : phase === "error" ? errorLabel : ""}
      </span>

      <style>{`
        @keyframes async-shake {
          0%, 100% { translate: 0 }
          20% { translate: -4px }
          40% { translate: 4px }
          60% { translate: -3px }
          80% { translate: 2px }
        }
        @keyframes async-spin { to { rotate: 360deg } }
        @keyframes async-draw { to { stroke-dashoffset: 0 } }
      `}</style>
    </>
  )
}

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 [animation:async-spin_700ms_linear_infinite]">
      <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path
        d="M8 1.5A6.5 6.5 0 0 1 14.5 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function Tick() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="size-3.5">
      <path
        d="M3 8.5 6.5 12 13 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1}
        className="[animation:async-draw_320ms_cubic-bezier(0.22,1,0.36,1)_60ms_forwards] motion-reduce:[animation:none] motion-reduce:[stroke-dashoffset:0]"
      />
    </svg>
  )
}
