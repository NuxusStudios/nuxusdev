"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FlipSlide {
  image: string
  alt: string
  label: string
}

function plate(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=900&h=620&fit=crop&q=76&auto=format`
}

export const FLIP_SLIDES: FlipSlide[] = [
  { image: plate("1470071459604-3b5ec3a7fe05"), alt: "Fog in a forested valley", label: "Low Country" },
  { image: plate("1418065460487-3e41a6c84dc5"), alt: "Bare hills under a hard sky", label: "Hard Light" },
  { image: plate("1433086966358-54859d0ed716"), alt: "A waterfall beneath a stone bridge", label: "Undertow" },
  { image: plate("1500530855697-b586d89ba3ee"), alt: "A road running into open country", label: "Third Rail" },
  { image: plate("1506744038136-46273834b3fb"), alt: "Still water beneath a ridgeline", label: "Still Water" },
]

const FLIP_MS = 760
const TEXT_SHIFT = 42
const TEXT_TURN = 44

/**
 * A slider that turns over instead of sliding: one card with two faces, and a
 * caption that flips the opposite way so the two never move as one object.
 *
 * The trick is that only the hidden face is ever rewritten. Its content changes
 * in the same commit that starts the rotation, while it is still facing away —
 * so the swap happens behind the card and there is never a frame showing the
 * outgoing image on the incoming side. That also means no clones, no crossfade,
 * and exactly two <img> elements no matter how long the list is.
 */
export function FlipSwitchSlider({
  slides = FLIP_SLIDES,
  direction = "horizontal",
  autoplay = true,
  autoplayMs = 3400,
  loop = true,
  className,
}: {
  slides?: FlipSlide[]
  direction?: "horizontal" | "vertical"
  autoplay?: boolean
  autoplayMs?: number
  loop?: boolean
  className?: string
}) {
  const vertical = direction === "vertical"
  const axis = vertical ? "rotateX" : "rotateY"
  const total = slides.length

  const [index, setIndex] = React.useState(0)
  const [faces, setFaces] = React.useState<[number, number]>([0, 1 % Math.max(1, total)])
  const [showingBack, setShowingBack] = React.useState(false)
  // Unbounded, so the card keeps turning the same way rather than unwinding.
  const [turn, setTurn] = React.useState(0)
  const [way, setWay] = React.useState<1 | -1>(1)
  const [held, setHeld] = React.useState(false)
  const busy = React.useRef(false)

  const flip = React.useCallback(
    (next: number, forward: boolean) => {
      if (busy.current || next === index) return
      busy.current = true
      window.setTimeout(() => {
        busy.current = false
      }, FLIP_MS)

      setWay(forward ? 1 : -1)
      setIndex(next)
      // Write to whichever face is currently pointing away from the viewer.
      setFaces(([front, back]) => (showingBack ? [next, back] : [front, next]))
      setShowingBack((prev) => !prev)
      setTurn((prev) => prev + (vertical ? (forward ? -180 : 180) : forward ? 180 : -180))
    },
    [index, showingBack, vertical],
  )

  const step = React.useCallback(
    (delta: number) => {
      const raw = index + delta
      if (!loop && (raw < 0 || raw >= total)) return
      flip(((raw % total) + total) % total, delta > 0)
    },
    [flip, index, loop, total],
  )

  React.useEffect(() => {
    if (!autoplay || held || total < 2) return
    const id = window.setInterval(() => step(1), autoplayMs)
    return () => window.clearInterval(id)
  }, [autoplay, autoplayMs, held, step, total])

  if (total === 0) return null

  const [frontIndex, backIndex] = faces
  const front = slides[frontIndex]!
  const back = slides[backIndex]!

  /** Where a caption sits when it is off-stage, on the side it leaves towards. */
  const parked = (leaving: boolean) => {
    const sign = leaving ? way : -way
    const shift = vertical ? `translateY(${-sign * TEXT_SHIFT}%)` : `translateX(${sign * TEXT_SHIFT}%)`
    const spin = vertical ? `rotateX(${sign * TEXT_TURN}deg)` : `rotateY(${-sign * TEXT_TURN}deg)`
    return `${shift} ${spin}`
  }

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-8 overflow-hidden bg-background py-14 text-foreground",
        className,
      )}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div className="relative flex w-full items-center justify-center">
        <div
          className="relative aspect-[3/2] w-[85vw] max-w-[680px] [perspective:1000px]"
          role="group"
          aria-roledescription="carousel"
          aria-label={slides[index]!.label}
        >
          <div
            className="relative h-full w-full [transform-style:preserve-3d] motion-reduce:transition-none"
            style={{
              transform: `${axis}(${turn}deg)`,
              transition: `transform ${FLIP_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
            }}
          >
            <Face src={front.image} alt={showingBack ? "" : front.alt} hidden={showingBack} />
            <Face
              src={back.image}
              alt={showingBack ? back.alt : ""}
              hidden={!showingBack}
              className={vertical ? "[transform:rotateX(180deg)]" : "[transform:rotateY(180deg)]"}
            />
          </div>
        </div>

        {/* Captions live above the card and turn against it. */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center [perspective:1000px]">
          <Caption text={front.label} on={!showingBack} parked={parked} />
          <Caption text={back.label} on={showingBack} parked={parked} />
        </div>
      </div>

      <div className="z-10 flex items-center gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.image}
            type="button"
            aria-label={`Go to ${slide.label}`}
            aria-current={i === index}
            onClick={() => flip(i, i > index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              i === index ? "w-6 bg-primary" : "w-2 bg-foreground/25 hover:bg-foreground/45",
            )}
          />
        ))}
      </div>

      <div className="z-10 flex gap-4">
        <Nav label="Previous" onClick={() => step(-1)} disabled={!loop && index === 0}>
          <ArrowLeft className="size-5" />
        </Nav>
        <Nav label="Next" onClick={() => step(1)} disabled={!loop && index === total - 1}>
          <ArrowRight className="size-5" />
        </Nav>
      </div>
    </div>
  )
}

function Face({
  src,
  alt,
  hidden,
  className,
}: {
  src: string
  alt: string
  hidden: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]",
        className,
      )}
    >
      {/* Eager: a face parked behind the card is not "visible" by the browser's
          reckoning, so a lazy image on it would never be fetched. */}
      <img src={src} alt={alt} loading="eager" draggable={false} className="h-full w-full object-cover" />
    </div>
  )
}

function Caption({
  text,
  on,
  parked,
}: {
  text: string
  on: boolean
  parked: (leaving: boolean) => string
}) {
  return (
    <span
      aria-hidden={!on}
      className="absolute text-center text-4xl font-semibold tracking-tight text-white drop-shadow-[0_4px_18px_rgb(0_0_0/0.6)] sm:text-6xl md:text-7xl motion-reduce:transition-none"
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : parked(!on),
        transition: `transform ${FLIP_MS * 0.62}ms cubic-bezier(0.76, 0, 0.24, 1), opacity ${
          on ? FLIP_MS * 0.45 : FLIP_MS * 0.25
        }ms ease`,
        transitionDelay: on ? `${FLIP_MS * 0.22}ms` : "0ms",
      }}
    >
      {text}
    </span>
  )
}

function Nav({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-12 items-center justify-center rounded-full border border-border bg-transparent text-foreground",
        "backdrop-blur-[10px] transition-colors duration-300 hover:bg-primary hover:text-primary-foreground",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      )}
    >
      {children}
    </button>
  )
}
