"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DeckCard {
  id: string
  tag: string
  title: string
  body: string
  src: string
}

function shot(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=800&h=600&fit=crop&q=75&auto=format`
}

export const DECK_CARDS: DeckCard[] = [
  { id: "atlas", tag: "Dashboard", title: "Atlas", body: "Every number on one screen, and none of them a screenshot.", src: shot("1551288049-bebda4e38f71") },
  { id: "relay", tag: "Inbox", title: "Relay", body: "Threads that stay threads, however many people join.", src: shot("1517245386807-bb43f82c33c4") },
  { id: "ledger", tag: "Billing", title: "Ledger", body: "Invoices that reconcile themselves and say so.", src: shot("1554224155-6726b3ff858f") },
  { id: "signal", tag: "Analytics", title: "Signal", body: "The three charts you actually look at, and no others.", src: shot("1460925895917-afdab827c52f") },
]

/** How far a card must travel before letting go throws it. */
const THROW_PX = 96
/** …or how fast, for a short flick that never gets that far. */
const THROW_VELOCITY = 0.55
const EXIT_MS = 340
const VISIBLE = 3

/**
 * A pile of cards you throw aside, which then come back underneath.
 *
 * The drag writes a transform straight to the card's node. Routing a
 * pointermove through state re-renders the whole deck for a number only one
 * element uses, and the lag shows up as the card trailing the finger.
 *
 * Letting go is judged on distance *or* speed. Distance alone punishes a fast
 * flick, which is how most people actually dismiss a card — they move a short
 * way and release while still moving.
 *
 * The deck rotates rather than shrinking: the thrown card goes to the back, so
 * there is always something under your finger and the control never becomes an
 * empty box.
 */
export function SwipeDeck({
  cards = DECK_CARDS,
  className,
}: {
  cards?: DeckCard[]
  className?: string
}) {
  const [deck, setDeck] = React.useState(cards)
  const [exit, setExit] = React.useState<-1 | 0 | 1>(0)
  const topRef = React.useRef<HTMLElement | null>(null)
  const drag = React.useRef({ active: false, x: 0, y: 0, dx: 0, t: 0, v: 0 })
  const timer = React.useRef(0)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const paint = (dx: number, dy: number) => {
    const node = topRef.current
    if (!node) return
    // Rotation proportional to travel: the card pivots about a point below
    // itself, the way a real card tips when you push one corner.
    node.style.transform = `translate3d(${dx}px, ${dy}px, 0) rotate(${dx * 0.045}deg)`
  }

  const throwAway = (dir: -1 | 1) => {
    if (exit !== 0) return
    setExit(dir)
    timer.current = window.setTimeout(() => {
      setDeck((prev) => (prev.length < 2 ? prev : [...prev.slice(1), prev[0]!]))
      setExit(0)
      // The next card inherits this node; clear the thrown one's transform so
      // it does not start its life mid-flight.
      if (topRef.current) topRef.current.style.transform = ""
    }, EXIT_MS)
  }

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (exit !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { active: true, x: event.clientX, y: event.clientY, dx: 0, t: event.timeStamp, v: 0 }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d.active) return
    const dx = event.clientX - d.x
    const dy = event.clientY - d.y
    const dt = event.timeStamp - d.t
    // Velocity from the last move only. Averaging over the whole gesture makes
    // a long slow drag that ends in a flick read as slow.
    if (dt > 0) d.v = (dx - d.dx) / dt
    d.dx = dx
    d.t = event.timeStamp
    paint(dx, dy)
  }

  const onPointerUp = () => {
    const d = drag.current
    if (!d.active) return
    d.active = false
    if (Math.abs(d.dx) > THROW_PX || Math.abs(d.v) > THROW_VELOCITY) {
      throwAway(d.dx < 0 ? -1 : 1)
      return
    }
    // Under the threshold: let it fall back, then drop the transition again so
    // the next drag is not fighting a 300ms ease.
    const node = topRef.current
    if (!node) return
    node.style.transition = `transform 300ms cubic-bezier(0.22, 1, 0.36, 1)`
    node.style.transform = ""
    window.setTimeout(() => {
      if (node) node.style.transition = ""
    }, 320)
  }

  return (
    <section
      className={cn(
        "flex w-full flex-col items-center gap-8 bg-background px-6 py-20 text-foreground",
        className,
      )}
    >
      <div className="relative h-[26rem] w-full max-w-sm select-none">
        {deck.map((card, i) => {
          const top = i === 0
          return (
            <article
              key={card.id}
              ref={top ? (node) => { topRef.current = node } : undefined}
              aria-hidden={!top}
              onPointerDown={top ? onPointerDown : undefined}
              onPointerMove={top ? onPointerMove : undefined}
              onPointerUp={top ? onPointerUp : undefined}
              onPointerCancel={top ? onPointerUp : undefined}
              style={{
                // Paint order is DOM order for absolutely positioned siblings,
                // so without this the last card in the array covers the one
                // you are actually dragging.
                zIndex: deck.length - i,
                ...(top
                  ? exit !== 0
                    ? {
                        transform: `translate3d(${exit * 140}%, -8%, 0) rotate(${exit * 22}deg)`,
                        opacity: 0,
                        transition: `transform ${EXIT_MS}ms cubic-bezier(0.32, 0, 0.67, 0), opacity ${EXIT_MS}ms linear`,
                      }
                    : null
                  : {
                      transform: `translateY(${i * 12}px) scale(${1 - i * 0.045})`,
                      opacity: i < VISIBLE ? 1 : 0,
                    }),
              }}
              className={cn(
                "absolute inset-0 overflow-hidden rounded-2xl border border-border bg-card",
                "shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9)]",
                top ? "cursor-grab touch-none active:cursor-grabbing" : "pointer-events-none",
                !top && "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
              )}
            >
              <img
                src={card.src}
                alt=""
                loading={i < VISIBLE ? "eager" : "lazy"}
                draggable={false}
                className="pointer-events-none block h-52 w-full object-cover"
              />
              <div className="p-6">
                <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-primary">
                  {card.tag}
                </span>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              </div>
            </article>
          )
        })}
      </div>

      <div className="flex items-center gap-3">
        <Nudge label="Throw left" onClick={() => throwAway(-1)}>
          <ArrowLeft aria-hidden className="size-4" />
        </Nudge>
        <p aria-live="polite" className="min-w-28 text-center text-[0.72rem] text-muted-foreground">
          {deck[0]?.title}
        </p>
        <Nudge label="Throw right" onClick={() => throwAway(1)}>
          <ArrowRight aria-hidden className="size-4" />
        </Nudge>
      </div>
    </section>
  )
}

function Nudge({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex size-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground",
        "transition-colors hover:border-foreground/25 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      {children}
    </button>
  )
}
