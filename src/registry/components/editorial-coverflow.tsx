"use client"

import * as React from "react"
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EditorialSlide {
  /** Small kicker printed above the title, e.g. "Issue 04". */
  kicker?: string
  title: string
  /** Second title line, set smaller and lighter. */
  subtitle?: string
  blurb?: string
  image: string
  alt: string
  actionLabel?: string
  href?: string
}

function photo(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=760&h=1100&fit=crop&q=72&auto=format`
}

export const EDITORIAL_SLIDES: EditorialSlide[] = [
  {
    kicker: "Issue 04",
    title: "COLD OPEN",
    subtitle: "Northern Light",
    blurb: "Three weeks above the treeline, shot entirely on expired stock.",
    image: photo("1470071459604-3b5ec3a7fe05"),
    alt: "Fog moving through a forested valley at first light",
    actionLabel: "Read",
  },
  {
    kicker: "Field Notes",
    title: "SALT FLAT",
    subtitle: "Nothing For Miles",
    blurb: "What happens to a horizon when you take every landmark away from it.",
    image: photo("1500530855697-b586d89ba3ee"),
    alt: "An empty road running straight into open country",
    actionLabel: "Read",
  },
  {
    kicker: "Portfolio",
    title: "UNDERSTORY",
    subtitle: "Light Through Pine",
    blurb: "A study of the twenty minutes a day the sun reaches the forest floor.",
    image: photo("1441974231531-c6227db76b6e"),
    alt: "Sunlight falling through a dense stand of trees",
    actionLabel: "View",
  },
  {
    kicker: "Issue 03",
    title: "UNDERTOW",
    subtitle: "Water Under Stone",
    blurb: "Long exposures of a river that has been rearranging its own bed for centuries.",
    image: photo("1433086966358-54859d0ed716"),
    alt: "A waterfall running beneath an old stone bridge",
    actionLabel: "Read",
  },
  {
    kicker: "Archive",
    title: "DRY SEASON",
    subtitle: "Hard Blue Sky",
    blurb: "Colour holds up badly in this heat, which turned out to be the point.",
    image: photo("1418065460487-3e41a6c84dc5"),
    alt: "Bare hills under a hard blue sky",
    actionLabel: "View",
  },
]

/**
 * A cover-flow deck where the whole section is graded by whichever card is
 * centred: the active photo is re-drawn behind everything, blown up and
 * crushed down to an ambient wash, so changing card changes the room.
 *
 * Cards are positioned by their *ring distance* from the active index rather
 * than by their array index, so the strip wraps in both directions without
 * cloning nodes. Only the centre card's copy is mounted as interactive —
 * the rest are inert, which keeps the tab order down to one card.
 */
export function EditorialCoverflow({
  slides = EDITORIAL_SLIDES,
  eyebrow = "Selected Work",
  autoplay = true,
  autoplayMs = 5200,
  className,
  onAction,
}: {
  slides?: EditorialSlide[]
  eyebrow?: string
  autoplay?: boolean
  autoplayMs?: number
  className?: string
  onAction?: (slide: EditorialSlide, index: number) => void
}) {
  const total = slides.length
  const [index, setIndex] = React.useState(0)
  const [held, setHeld] = React.useState(false)
  const touchX = React.useRef(0)

  const go = React.useCallback(
    (delta: number) => setIndex((prev) => (prev + delta + total) % total),
    [total],
  )

  React.useEffect(() => {
    if (!autoplay || held || total < 2) return
    const id = window.setInterval(() => go(1), autoplayMs)
    return () => window.clearInterval(id)
  }, [autoplay, autoplayMs, go, held, total])

  const active = slides[index]
  if (!active) return null

  return (
    <section
      className={cn(
        "relative flex min-h-[680px] w-full select-none items-center justify-center overflow-hidden bg-background py-14 text-foreground",
        className,
      )}
      role="group"
      aria-roledescription="carousel"
      aria-label={eyebrow}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") { event.preventDefault(); go(-1) }
        if (event.key === "ArrowRight") { event.preventDefault(); go(1) }
      }}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      onTouchStart={(event) => { touchX.current = event.touches[0]!.clientX }}
      onTouchEnd={(event) => {
        const drift = event.changedTouches[0]!.clientX - touchX.current
        if (Math.abs(drift) > 44) go(drift < 0 ? 1 : -1)
      }}
    >
      {/* Ambient grade — the centred photo, enlarged and pushed down to a wash. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {slides.map((slide, i) => (
          <img
            key={slide.image}
            src={slide.image}
            alt=""
            className="absolute inset-0 h-full w-full scale-125 object-cover transition-opacity duration-1000"
            style={{ filter: "blur(44px) brightness(0.3) saturate(1.3)", opacity: i === index ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-background)_112%)]" />
        <div className="absolute inset-0 bg-background/55" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center px-4">
        {eyebrow ? (
          <div className="mb-9 flex items-center gap-3">
            <span className="h-px w-9 bg-gradient-to-r from-transparent to-primary" />
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-primary">
              {eyebrow}
            </h3>
            <span className="h-px w-9 bg-gradient-to-l from-transparent to-primary" />
          </div>
        ) : null}

        <div className="relative flex h-[460px] w-full items-center justify-center [perspective:1400px]">
          {slides.map((slide, i) => {
            // Fold the gap into the shorter way round the ring: with 5 cards,
            // slide 4 sits at -1 from slide 0, not at +4.
            const raw = i - index
            const ring = raw > total / 2 ? raw - total : raw < -total / 2 ? raw + total : raw
            const side = Math.sign(ring)
            const depth = Math.min(Math.abs(ring), 3)
            const centred = depth === 0

            const shift = side * [0, 262, 470, 560][depth]!
            const scale = [1, 0.84, 0.68, 0.52][depth]!
            const turn = -side * [0, 24, 38, 44][depth]!
            const opacity = [1, 0.62, 0.34, 0][depth]!

            return (
              <article
                key={slide.image}
                aria-hidden={!centred}
                onClick={() => { if (!centred && depth < 3) setIndex(i) }}
                className={cn(
                  "absolute h-[440px] w-[300px] overflow-hidden rounded-2xl border border-border bg-card",
                  "transition-[transform,opacity,filter,box-shadow] duration-[750ms] ease-[cubic-bezier(0.25,1,0.5,1)]",
                  centred ? "cursor-default" : depth < 3 ? "cursor-pointer" : "pointer-events-none",
                )}
                style={{
                  transform: `translateX(${shift}px) scale(${scale}) rotateY(${turn}deg)`,
                  opacity,
                  zIndex: 30 - depth,
                  filter: centred ? "none" : `brightness(${0.78 - depth * 0.1})`,
                  boxShadow: centred
                    ? "0 26px 60px rgb(0 0 0 / 0.55), 0 0 34px color-mix(in oklch, var(--color-primary) 28%, transparent)"
                    : "0 14px 34px rgb(0 0 0 / 0.4)",
                }}
              >
                {/* Never lazy: a card inside a rotated, clipped stage may never
                    enter the viewport by the browser's reckoning. */}
                <img
                  src={slide.image}
                  alt={slide.alt}
                  loading="eager"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 via-30% to-black/95"
                />

                <div
                  className="relative flex h-full flex-col justify-between p-5 text-center"
                  style={{
                    opacity: centred ? 1 : 0,
                    transform: centred ? "translateY(0)" : "translateY(14px)",
                    transition: "opacity 450ms ease, transform 450ms ease",
                  }}
                >
                  {slide.kicker ? (
                    <p className="self-end text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white drop-shadow-[0_2px_6px_rgb(0_0_0/0.9)]">
                      {slide.kicker}
                    </p>
                  ) : <span />}

                  <div className="mt-auto flex flex-col items-center">
                    <h2 className="text-2xl font-black uppercase leading-tight tracking-[0.04em] text-white drop-shadow-[0_3px_12px_rgb(0_0_0/0.95)]">
                      {slide.title}
                    </h2>
                    {slide.subtitle ? (
                      <p className="mt-0.5 text-base font-semibold uppercase tracking-[0.06em] text-white/85 drop-shadow-[0_3px_10px_rgb(0_0_0/0.9)]">
                        {slide.subtitle}
                      </p>
                    ) : null}

                    <span aria-hidden className="my-2 h-0.5 w-9 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />

                    {slide.blurb ? (
                      <p className="mb-3 max-w-[17rem] text-[0.8rem] italic leading-snug text-white/85 drop-shadow-[0_2px_8px_rgb(0_0_0/0.9)]">
                        {slide.blurb}
                      </p>
                    ) : null}

                    <a
                      href={slide.href ?? "#"}
                      tabIndex={centred ? 0 : -1}
                      onClick={(event) => {
                        if (!onAction) return
                        event.preventDefault()
                        onAction(slide, i)
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5",
                        "text-[0.68rem] font-bold uppercase tracking-[0.14em] text-primary-foreground no-underline",
                        "transition-transform hover:scale-105",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                      )}
                    >
                      {slide.actionLabel ?? "Read"}
                      <ArrowUpRight className="size-3" strokeWidth={2.5} />
                    </a>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mt-8 flex items-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.image}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to ${slide.title}`}
              aria-current={i === index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                i === index ? "w-7 bg-primary shadow-[0_0_10px_var(--color-primary)]" : "w-2 bg-foreground/25 hover:bg-foreground/45",
              )}
            />
          ))}
        </div>
      </div>

      <Arrow side="left" onClick={() => go(-1)} />
      <Arrow side="right" onClick={() => go(1)} />
    </section>
  )
}

function Arrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={cn(
        "absolute top-1/2 z-30 flex size-11 -translate-y-1/2 items-center justify-center rounded-full",
        "border border-border bg-background/55 text-foreground backdrop-blur-md",
        "transition-colors hover:bg-background/80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        side === "left" ? "left-4" : "right-4",
      )}
    >
      <Icon className="size-5" strokeWidth={2.5} />
    </button>
  )
}
