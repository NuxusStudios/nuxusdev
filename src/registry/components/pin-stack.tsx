"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface PinCard {
  id: string
  label: string
  title: string
  body: string
  points: string[]
}

export const PIN_CARDS: PinCard[] = [
  {
    id: "browse",
    label: "Step one",
    title: "Find it running",
    body: "Every component in the registry renders live, in the theme you are already using.",
    points: ["No screenshots", "No sandbox that lies", "Keyboard paths included"],
  },
  {
    id: "theme",
    label: "Step two",
    title: "Make it yours",
    body: "Colour, radius and type come from your tokens, so a paste lands in your palette rather than ours.",
    points: ["Thirty themes", "Or bring your own", "Dark and light both real"],
  },
  {
    id: "copy",
    label: "Step three",
    title: "Take the source",
    body: "One file, no runtime dependency pointing back at us. Change it the moment it lands.",
    points: ["MIT licence", "TypeScript types", "Dependencies listed up front"],
  },
  {
    id: "ship",
    label: "Step four",
    title: "Or hand it to an agent",
    body: "Each component ships a prompt that describes it well enough to be rebuilt into your screen.",
    points: ["Tool agnostic", "Reads your file tree", "Stops guessing at markup"],
  },
]

/**
 * Cards that pin as you scroll and pile up, the newest landing on top.
 *
 * The stacking is `position: sticky` and nothing else — each card sticks a
 * little lower than the one before, so the page scrolls past them while they
 * hold their place and collect. A scroll handler computing the same effect
 * would be a frame behind the browser on every one of them.
 *
 * The depth cues are static: cards further down the list sit slightly smaller
 * and dimmer, which is what makes a pile read as a pile once they overlap.
 * Nothing needs to know the scroll position for that to hold.
 */
/** How far below the top of the viewport the pile parks. */
const SHELF_PX = 96
/** How much lower each card parks than the one before it. */
const STEP_PX = 14

export function PinStack({
  cards = PIN_CARDS,
  eyebrow = "How it goes",
  title = "Four steps, no meetings",
  className,
}: {
  cards?: PinCard[]
  eyebrow?: string
  title?: string
  className?: string
}) {
  const [top, setTop] = React.useState(0)
  const slotRefs = React.useRef<(HTMLLIElement | null)[]>([])

  // The stacking itself is CSS and needs none of this. The rail does: which
  // card is on top cannot be observed, because once cards are pinned they all
  // sit on the shelf at once and an IntersectionObserver reports every one of
  // them as present. Asking each card whether it has reached its own shelf
  // position is the only question with a single answer.
  React.useEffect(() => {
    // The list item, not the card inside it: the card carries a scale, and a
    // scaled box reports a top a few pixels below where it is actually parked.
    const nodes = slotRefs.current.filter(Boolean) as HTMLLIElement[]
    if (nodes.length === 0) return

    let queued = false

    const read = () => {
      queued = false
      let parked = 0
      for (let i = 0; i < nodes.length; i++) {
        // A pixel of slack: a pinned element's top lands on its shelf value,
        // give or take subpixel rounding.
        if (nodes[i]!.getBoundingClientRect().top <= SHELF_PX + i * STEP_PX + 1) parked = i
      }
      setTop(parked)
    }

    const onScroll = () => {
      if (queued) return
      queued = true
      requestAnimationFrame(read)
    }

    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [cards])

  return (
    <section className={cn("w-full bg-background px-4 py-24 text-foreground md:px-6", className)}>
      <div className="mx-auto max-w-3xl">
        <header className="pb-14 text-center">
          {eyebrow ? (
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>

          <div aria-hidden className="mt-8 flex items-center justify-center gap-1.5">
            {cards.map((card, i) => (
              <span
                key={card.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  i === top ? "w-8 bg-primary" : "w-4 bg-foreground/15",
                )}
              />
            ))}
          </div>
        </header>

        <ol className="relative">
          {cards.map((card, i) => (
            <li
              key={card.id}
              ref={(node) => {
                slotRefs.current[i] = node
              }}
              // Each card sticks 14px lower than the last, so the ones already
              // parked stay visible as a stepped edge instead of a single slab.
              //
              // The padding below is the card's scroll run. Without it every
              // card arrives at once and there is no pile, only a jump — and it
              // has to be padding on the card's own box rather than a gap after
              // the list, or the card stops sticking the moment the list ends.
              style={{ top: `calc(${SHELF_PX}px + ${i * STEP_PX}px)`, zIndex: i + 1 }}
              className="sticky pb-[62vh]"
            >
              <article
                style={{
                  // Depth, not motion: later cards read as further back until
                  // they arrive, which is what stops the pile looking flat.
                  transform: `scale(${1 - (cards.length - 1 - i) * 0.018})`,
                }}
                className={cn(
                  "rounded-2xl border border-border bg-card p-8 transition-[border-color] duration-500",
                  "shadow-[0_24px_60px_-32px_rgb(0_0_0/0.9)]",
                  i === top && "border-primary/50",
                )}
              >
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-primary">
                    {card.label}
                  </span>
                  <span className="font-mono text-[0.7rem] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")} / {String(cards.length).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>

                <ul className="mt-6 flex flex-wrap gap-2">
                  {card.points.map((point) => (
                    <li
                      key={point}
                      className="rounded-full border border-border px-3 py-1 text-[0.72rem] text-muted-foreground"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
