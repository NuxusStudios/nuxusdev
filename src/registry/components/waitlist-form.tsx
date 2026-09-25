"use client"

import * as React from "react"
import { ArrowRight, Check, LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Phase = "idle" | "invalid" | "pending" | "done"

const FACES = [
  "1494790108377-be9c29b29330",
  "1507003211169-0a1dd7228f2d",
  "1438761681033-6461ffad8d80",
  "1500648767791-00dcc994a43e",
  "1534528741775-53994a69daeb",
]

/**
 * An email capture that answers before the server does.
 *
 * Validation runs on submit, not on every keystroke. Telling somebody their
 * address is wrong while they are still in the middle of typing it is noise,
 * and it trains people to ignore the message that eventually matters.
 *
 * The phases are one value rather than three booleans. `pending` and `done`
 * and `invalid` are mutually exclusive by definition, and separate flags let a
 * form claim to be two of them at once the first time a request is retried.
 *
 * Nothing here talks to a server: `onJoin` is where yours goes. The component
 * owns the choreography, the caller owns the request.
 */
export function WaitlistForm({
  onJoin,
  title = "Get it before it ships",
  blurb = "One email when the registry opens. Nothing else, ever.",
  joined = 2481,
  className,
}: {
  onJoin?: (email: string) => Promise<void>
  title?: string
  blurb?: string
  joined?: number
  className?: string
}) {
  const [phase, setPhase] = React.useState<Phase>("idle")
  const [email, setEmail] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const alive = React.useRef(true)

  React.useEffect(() => {
    // Set on the way in as well as cleared on the way out: Strict Mode mounts,
    // cleans up and mounts again, and a flag only cleared in the teardown
    // stays false for the rest of the component's life.
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (phase === "pending" || phase === "done") return

    const value = email.trim()
    if (!inputRef.current?.checkValidity() || !value) {
      setPhase("invalid")
      inputRef.current?.focus()
      return
    }

    setPhase("pending")
    try {
      await (onJoin ? onJoin(value) : new Promise((resolve) => setTimeout(resolve, 900)))
      if (alive.current) setPhase("done")
    } catch {
      if (alive.current) setPhase("invalid")
    }
  }

  return (
    <section
      className={cn(
        "flex w-full flex-col items-center bg-background px-6 py-24 text-center text-foreground",
        className,
      )}
    >
      <h2 className="max-w-lg text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        {blurb}
      </p>

      <form onSubmit={submit} noValidate className="mt-9 w-full max-w-md">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border bg-card p-1.5 transition-colors duration-300",
            phase === "invalid" ? "border-destructive" : "border-border focus-within:border-foreground/30",
          )}
        >
          <label htmlFor="waitlist-email" className="sr-only">
            Email address
          </label>
          <input
            ref={inputRef}
            id="waitlist-email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@studio.com"
            value={email}
            disabled={phase === "pending" || phase === "done"}
            aria-invalid={phase === "invalid"}
            aria-describedby="waitlist-status"
            onChange={(event) => {
              setEmail(event.target.value)
              // Clear the complaint as soon as they start fixing it, so the
              // red border is about the last submit and not about them.
              if (phase === "invalid") setPhase("idle")
            }}
            className={cn(
              "min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground",
              "disabled:opacity-60",
            )}
          />

          <button
            type="submit"
            disabled={phase === "pending" || phase === "done"}
            className={cn(
              "grid shrink-0 place-items-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              phase === "done" ? "bg-primary/15 text-primary" : "bg-primary text-primary-foreground hover:opacity-90",
              "disabled:pointer-events-none",
            )}
          >
            {/*
              Every label shares one grid cell, so the button is as wide as its
              widest state from the start and never resizes under the pointer.
            */}
            <span className={cn("col-start-1 row-start-1 flex items-center gap-2", phase !== "idle" && phase !== "invalid" && "invisible")}>
              Join
              <ArrowRight aria-hidden className="size-4" />
            </span>
            <span className={cn("col-start-1 row-start-1 flex items-center gap-2", phase !== "pending" && "invisible")}>
              <LoaderCircle aria-hidden className="size-4 animate-spin motion-reduce:animate-none" />
              Joining
            </span>
            <span className={cn("col-start-1 row-start-1 flex items-center gap-2", phase !== "done" && "invisible")}>
              <Check aria-hidden className="size-4" />
              You are in
            </span>
          </button>
        </div>

        <p
          id="waitlist-status"
          aria-live="polite"
          className={cn(
            "mt-3 min-h-5 text-[0.75rem]",
            phase === "invalid" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {phase === "invalid" ? "That address does not look right. Have another go." : null}
          {phase === "done" ? "Confirmed. We will write once, and only once." : null}
        </p>
      </form>

      <div className="mt-10 flex items-center gap-3">
        <span aria-hidden className="flex -space-x-2.5">
          {FACES.map((face, i) => (
            <img
              key={face}
              src={`https://images.unsplash.com/photo-${face}?w=64&h=64&fit=crop&crop=faces&q=70&auto=format`}
              alt=""
              loading="lazy"
              className="size-7 rounded-full border-2 border-background object-cover"
              style={{ zIndex: FACES.length - i }}
            />
          ))}
        </span>
        <p className="text-[0.75rem] text-muted-foreground">
          <span className="font-medium text-foreground">
            {(joined + (phase === "done" ? 1 : 0)).toLocaleString()}
          </span>{" "}
          already waiting
        </p>
      </div>
    </section>
  )
}
