"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AutoTab {
  id: string
  label: string
  title: string
  body: string
  src: string
}

function shot(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=1200&h=800&fit=crop&q=75&auto=format`
}

export const AUTO_TABS: AutoTab[] = [
  {
    id: "preview",
    label: "Preview",
    title: "See it run first",
    body: "Every component renders live in the theme you are already using, so nothing is a surprise after the paste.",
    src: shot("1551288049-bebda4e38f71"),
  },
  {
    id: "theme",
    label: "Theme",
    title: "Your tokens, not ours",
    body: "Colour, radius and type are read from your own stylesheet. Thirty themes ship with it, and yours is the thirty-first.",
    src: shot("1541701494587-cb58502866ab"),
  },
  {
    id: "copy",
    label: "Copy",
    title: "One file, yours outright",
    body: "No runtime dependency pointing back at us. The moment it lands in your tree you can change anything in it.",
    src: shot("1517180102446-f3ece451e9d8"),
  },
  {
    id: "prompt",
    label: "Prompt",
    title: "Or hand it to an agent",
    body: "Each component ships a description complete enough to rebuild it into the screen you are already working on.",
    src: shot("1531482615713-2afd69097998"),
  },
]

/**
 * Feature tabs that move on by themselves, with the wait drawn on the tab.
 *
 * The timer is the progress bar. A CSS animation runs for the dwell time and
 * its `animationend` advances the tab, so the bar cannot drift out of step
 * with a `setInterval` it knows nothing about — and pausing is one CSS
 * property rather than a cleared timeout and a remembered remainder.
 *
 * The bar is keyed on the active tab, which remounts it and restarts the
 * animation from zero. Without the key React reuses the element and the
 * animation carries on from wherever it had got to.
 *
 * Hovering or focusing anywhere in the section pauses it: a panel that slides
 * away mid-sentence is worse than no automation at all.
 */
export function AutoTabs({
  tabs = AUTO_TABS,
  /** Seconds each tab holds before handing on. */
  dwell = 6,
  eyebrow = "What you get",
  title = "Four reasons, one at a time",
  className,
}: {
  tabs?: AutoTab[]
  dwell?: number
  eyebrow?: string
  title?: string
  className?: string
}) {
  const [active, setActive] = React.useState(0)
  const [held, setHeld] = React.useState(false)

  const current = tabs[active] ?? tabs[0]!

  return (
    <section
      className={cn("w-full bg-background px-4 py-20 text-foreground md:px-6", className)}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocusCapture={() => setHeld(true)}
      onBlurCapture={() => setHeld(false)}
    >
      <div className="mx-auto max-w-5xl">
        <header className="max-w-xl pb-10">
          {eyebrow ? (
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        </header>

        <div role="tablist" aria-label={title} className="grid gap-2 sm:grid-cols-4">
          {tabs.map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={i === active}
              aria-controls={`panel-${tab.id}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
                event.preventDefault()
                const next = (i + (event.key === "ArrowLeft" ? -1 : 1) + tabs.length) % tabs.length
                setActive(next)
                document.getElementById(`tab-${tabs[next]!.id}`)?.focus()
              }}
              className={cn(
                "group/tab rounded-lg px-1 pb-3 pt-2 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              )}
            >
              <span
                className={cn(
                  "block text-sm font-medium transition-colors",
                  i === active ? "text-foreground" : "text-muted-foreground group-hover/tab:text-foreground",
                )}
              >
                {tab.label}
              </span>

              <span aria-hidden className="mt-2 block h-0.5 w-full overflow-hidden rounded-full bg-foreground/10">
                {i === active ? (
                  <span
                    // Keyed on the tab so it remounts and starts from zero.
                    key={tab.id}
                    onAnimationEnd={() => setActive((prev) => (prev + 1) % tabs.length)}
                    style={{ ["--dwell" as string]: `${dwell}s`, animationPlayState: held ? "paused" : "running" }}
                    className={cn(
                      "block h-full w-full origin-left rounded-full bg-primary",
                      "[animation:auto-tab-fill_var(--dwell)_linear_forwards]",
                      // Reduced motion: the bar sits full and nothing advances.
                      "motion-reduce:[animation:none] motion-reduce:scale-x-100",
                    )}
                  />
                ) : (
                  <span
                    className={cn(
                      "block h-full rounded-full bg-primary/40 transition-[width] duration-500",
                      i < active ? "w-full" : "w-0",
                    )}
                  />
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 grid items-center gap-8 lg:grid-cols-2">
          <div
            role="tabpanel"
            id={`panel-${current.id}`}
            aria-labelledby={`tab-${current.id}`}
            className="min-h-40"
          >
            <h3 className="text-2xl font-semibold tracking-tight">{current.title}</h3>
            <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
              {current.body}
            </p>
          </div>

          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl border border-border bg-card">
            {tabs.map((tab, i) => (
              <img
                key={tab.id}
                src={tab.src}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                draggable={false}
                aria-hidden={i !== active}
                className={cn(
                  "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  i === active ? "opacity-100 [transform:none]" : "opacity-0 [transform:scale(1.04)]",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes auto-tab-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }
      `}</style>
    </section>
  )
}
