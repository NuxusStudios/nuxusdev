"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SpotlightStep {
  id: string
  label: string
  title: string
  body: string
  visual?: React.ReactNode
}

/** Stand-in product shots, built from tokens so they follow the theme. */
function Mock({ variant }: { variant: 0 | 1 | 2 }) {
  return (
    <div className="flex h-full w-full flex-col gap-2.5 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="size-2 rounded-full bg-foreground/20" />
        <span className="size-2 rounded-full bg-foreground/20" />
      </div>

      {variant === 0 ? (
        <div className="grid flex-1 grid-cols-3 gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-background/60"
              style={{ opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      ) : null}

      {variant === 1 ? (
        <div className="flex flex-1 flex-col justify-end gap-2 pb-1">
          {[72, 46, 88, 34, 61].map((height, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="h-1.5 w-10 shrink-0 rounded-full bg-foreground/15" />
              <span
                className="h-1.5 rounded-full bg-primary/70"
                style={{ width: `${height}%` }}
              />
            </div>
          ))}
        </div>
      ) : null}

      {variant === 2 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full space-y-2 rounded-lg border border-border bg-background/60 p-3">
            <span className="block h-1.5 w-1/3 rounded-full bg-primary/70" />
            <span className="block h-1.5 w-full rounded-full bg-foreground/12" />
            <span className="block h-1.5 w-5/6 rounded-full bg-foreground/12" />
            <span className="mt-3 block h-6 w-24 rounded-full bg-primary/80" />
          </div>
        </div>
      ) : null}
    </div>
  )
}

export const SPOTLIGHT_STEPS: SpotlightStep[] = [
  {
    id: "browse",
    label: "01",
    title: "Browse what already runs",
    body: "Every component in the registry renders live before you take it. No screenshots, no guessing whether the animation survives your stack.",
    visual: <Mock variant={0} />,
  },
  {
    id: "theme",
    label: "02",
    title: "Point it at your tokens",
    body: "Components read from your theme rather than shipping their own palette, so a paste lands in your colours instead of somebody else's.",
    visual: <Mock variant={1} />,
  },
  {
    id: "ship",
    label: "03",
    title: "Copy the code, or the prompt",
    body: "Take the source outright, or hand the prompt to your agent and let it wire the component into the screen you are already building.",
    visual: <Mock variant={2} />,
  },
]

/**
 * A feature walkthrough where the copy scrolls and the visual stays put.
 *
 * Which step is "current" is decided by a band across the middle of the
 * viewport rather than by scroll arithmetic. Computing it from scrollY means
 * re-deriving offsets on every resize, every font swap and every image that
 * loads late; an observer with a middle-band root margin is told when the
 * answer changes and is right without being recalculated.
 *
 * Below the large breakpoint there is nothing to pin, so each visual is
 * rendered inline with its own step and the observer is left idle.
 */
export function ScrollSpotlight({
  steps = SPOTLIGHT_STEPS,
  eyebrow = "How it works",
  title = "From registry to running screen",
  className,
}: {
  steps?: SpotlightStep[]
  eyebrow?: string
  title?: string
  className?: string
}) {
  const [active, setActive] = React.useState(0)
  const stepRefs = React.useRef<(HTMLElement | null)[]>([])

  React.useEffect(() => {
    const nodes = stepRefs.current.filter(Boolean) as HTMLElement[]
    if (nodes.length === 0) return

    const seen = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = nodes.indexOf(entry.target as HTMLElement)
          if (index >= 0) setActive(index)
        }
      },
      // A thin band across the middle: whatever crosses it becomes current.
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    )

    for (const node of nodes) seen.observe(node)
    return () => seen.disconnect()
  }, [steps])

  return (
    <section className={cn("w-full bg-background px-4 py-20 text-foreground md:px-6", className)}>
      <div className="mx-auto max-w-5xl">
        <header className="max-w-xl pb-12">
          {eyebrow ? (
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
        </header>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ol className="flex flex-col gap-16 lg:gap-0">
            {steps.map((step, i) => (
              <li
                key={step.id}
                ref={(node) => {
                  stepRefs.current[i] = node
                }}
                // Each step needs real scroll distance of its own, or the band
                // that decides the current step never reaches the later ones.
                className="scroll-mt-24 lg:flex lg:min-h-[58vh] lg:flex-col lg:justify-center"
              >
                <div className="flex gap-4">
                  {/* Rail: the marker fills in as its step becomes current. */}
                  <div aria-hidden className="flex shrink-0 flex-col items-center pt-1">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border text-[0.65rem] font-semibold transition-colors duration-500",
                        i <= active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                    {i < steps.length - 1 ? (
                      <span className="mt-2 w-px flex-1 bg-border" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className={cn(
                        "text-lg font-semibold tracking-tight transition-colors duration-500 sm:text-xl",
                        i === active ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-2.5 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>

                    {/* Nothing is pinned on small screens, so the visual rides along. */}
                    <div className="mt-6 aspect-[4/3] w-full lg:hidden">{step.visual}</div>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-24 aspect-[4/3] w-full">
              <div className="relative h-full w-full">
                {steps.map((step, i) => (
                  <div
                    key={step.id}
                    aria-hidden={i !== active}
                    className={cn(
                      "absolute inset-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      i === active
                        ? "pointer-events-auto opacity-100 [transform:none]"
                        : "pointer-events-none opacity-0 [transform:scale(0.97)]",
                    )}
                  >
                    {step.visual}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
