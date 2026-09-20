"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The band at the bottom of a landing page, where the reader has either been
 * convinced or hasn't.
 *
 * The glow follows the pointer through two CSS variables written straight to
 * the element. Putting cursor coordinates in React state re-renders the whole
 * section on every mouse move for two numbers that only ever reach a gradient.
 *
 * It is also the last thing on the page, so it stops animating when it scrolls
 * out of view rather than keeping a listener alive for a section nobody is
 * looking at.
 */
export function ClosingCta({
  eyebrow = "Ready when you are",
  title = "Ship the interface,\nnot the boilerplate",
  blurb = "Every component runs live in the browser before you take it. Copy the code, or hand the prompt to your agent.",
  primary = "Browse the registry",
  secondary = "Read the docs",
  onPrimary,
  onSecondary,
  footnote = "Free and MIT licensed · No account needed to copy",
  className,
}: {
  eyebrow?: string
  title?: string
  blurb?: string
  primary?: string
  secondary?: string
  onPrimary?: () => void
  onSecondary?: () => void
  footnote?: string
  className?: string
}) {
  const panelRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    let live = true
    const track = (event: PointerEvent) => {
      if (!live) return
      const rect = panel.getBoundingClientRect()
      panel.style.setProperty("--x", `${((event.clientX - rect.left) / rect.width) * 100}%`)
      panel.style.setProperty("--y", `${((event.clientY - rect.top) / rect.height) * 100}%`)
    }

    // Only listen while the band is actually on screen.
    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          live = entry.isIntersecting
          if (live) window.addEventListener("pointermove", track, { passive: true })
          else window.removeEventListener("pointermove", track)
        }
      },
      { rootMargin: "128px" },
    )
    seen.observe(panel)

    return () => {
      seen.disconnect()
      window.removeEventListener("pointermove", track)
    }
  }, [])

  const lines = title.split("\n")

  return (
    <section className={cn("w-full bg-background px-4 py-20 text-foreground md:px-6", className)}>
      <div
        ref={panelRef}
        className={cn(
          "group relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-12",
          "[--x:50%] [--y:0%]",
        )}
      >
        {/* Pointer-tracked wash, sitting under a faint ruled grid. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(420px circle at var(--x) var(--y), color-mix(in oklch, var(--color-primary) 16%, transparent), transparent 70%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,var(--color-foreground)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-foreground)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]"
        />

        <div className="relative">
          {eyebrow ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-primary" />
              {eyebrow}
            </span>
          ) : null}

          <h2 className="mt-6 text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <span
                  className="block [animation:cta-rise_700ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:[animation:none]"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h2>

          {blurb ? (
            <p className="mx-auto mt-5 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {blurb}
            </p>
          ) : null}

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onPrimary}
              className={cn(
                "group/btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground sm:w-auto",
                "transition-transform duration-200 hover:scale-[1.03] active:scale-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              )}
            >
              {primary}
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>

            {secondary ? (
              <button
                type="button"
                onClick={onSecondary}
                className={cn(
                  "inline-flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-foreground sm:w-auto",
                  "transition-colors hover:border-foreground/25 hover:bg-foreground/[0.04]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                )}
              >
                {secondary}
              </button>
            ) : null}
          </div>

          {footnote ? (
            <p className="mt-6 text-[0.72rem] text-muted-foreground/80">{footnote}</p>
          ) : null}
        </div>
      </div>

      <style>{`
        @keyframes cta-rise { from { transform: translateY(105%) } to { transform: translateY(0) } }
      `}</style>
    </section>
  )
}
