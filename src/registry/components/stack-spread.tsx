"use client"

// Adapted from Stack Spread, built using Hyperiux Vault: https://vault.hyperiux.com
// Images replaced with Unsplash photography; original artwork not redistributed.

import * as React from "react"
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react"

const IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=700&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=700&q=80&auto=format&fit=crop",
]

export interface StackSpreadCard {
  src: string
  alt?: string
  /** position while clustered, in vw/vh */
  stackOffset: { x: number; y: number }
  stackRotate: number
  /** final position once scattered */
  target: { x: number; y: number; rotate: number; scale: number; w: number; h: number }
  /** final position on touch devices, which use a two-column grid instead */
  targetSm: { x: number; y: number }
  z: number
}

const CARDS: StackSpreadCard[] = [
  { src: IMAGES[7], stackOffset: { x: -8, y: -10 }, stackRotate: -18, target: { x: -20, y: -34, rotate: 0, scale: 0.7, w: 17, h: 22 }, targetSm: { x: -22, y: -40 }, z: 2 },
  { src: IMAGES[6], stackOffset: { x: 14, y: -10 }, stackRotate: 20, target: { x: 32, y: -30, rotate: 0, scale: 0.9, w: 18, h: 32 }, targetSm: { x: 22, y: -40 }, z: 3 },
  { src: IMAGES[5], stackOffset: { x: -16, y: 0 }, stackRotate: -4, target: { x: -36, y: -2, rotate: 0, scale: 0.9, w: 15, h: 32 }, targetSm: { x: -22, y: -19 }, z: 4 },
  { src: IMAGES[4], stackOffset: { x: 1, y: -10 }, stackRotate: -2, target: { x: 6, y: -32, rotate: 0, scale: 0.8, w: 25, h: 30 }, targetSm: { x: 22, y: -19 }, z: 5 },
  { src: IMAGES[3], stackOffset: { x: 18, y: 1 }, stackRotate: 6, target: { x: 37, y: 6, rotate: 0, scale: 0.8, w: 18, h: 32 }, targetSm: { x: -22, y: 20 }, z: 6 },
  { src: IMAGES[2], stackOffset: { x: -6, y: 10 }, stackRotate: 6, target: { x: -24, y: 34, rotate: 0, scale: 0.9, w: 22, h: 25 }, targetSm: { x: 22, y: 20 }, z: 7 },
  { src: IMAGES[1], stackOffset: { x: 8, y: 7 }, stackRotate: 3, target: { x: 2, y: 36, rotate: 0, scale: 0.8, w: 20, h: 26 }, targetSm: { x: -22, y: 40 }, z: 8 },
  { src: IMAGES[0], stackOffset: { x: 20, y: 12 }, stackRotate: -7, target: { x: 30, y: 34, rotate: 0, scale: 0.9, w: 16, h: 20 }, targetSm: { x: 22, y: 40 }, z: 9 },
]

const SCATTER_START = 0.12
const SCATTER_END = 0.9
const PARALLAX_X = 2.6
const PARALLAX_Y = 2.2
const PARALLAX_SPRING = { stiffness: 90, damping: 22, mass: 0.6 }

const depthOf = (i: number, total: number) => (total <= 1 ? 1 : 0.55 + (i / (total - 1)) * 0.75)

/**
 * Touch vs. width, deliberately: a narrow but mouse-driven frame — a split
 * editor, a preview pane — should keep the scatter and the pointer parallax.
 * Only real touch devices drop to the stacked column layout.
 */
function useCoarsePointer(): boolean {
  return React.useSyncExternalStore(
    (callback) => {
      const query = window.matchMedia("(pointer: coarse)")
      query.addEventListener("change", callback)
      return () => query.removeEventListener("change", callback)
    },
    () => window.matchMedia("(pointer: coarse)").matches,
    () => false
  )
}

function usePointerParallax(active: boolean, enabled: boolean) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, PARALLAX_SPRING)
  const y = useSpring(rawY, PARALLAX_SPRING)

  React.useEffect(() => {
    if (!enabled) return
    if (!active) {
      rawX.set(0)
      rawY.set(0)
      return
    }

    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1)
      rawY.set((event.clientY / window.innerHeight) * 2 - 1)
    }
    const onLeave = () => {
      rawX.set(0)
      rawY.set(0)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerleave", onLeave)
    return () => {
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
    }
  }, [active, enabled, rawX, rawY])

  return { x, y }
}

function Card({
  card,
  progress,
  reduce,
  isSmall,
  stackScale,
  cardRadius,
  pointer,
  depth,
}: {
  card: StackSpreadCard
  progress: MotionValue<number>
  reduce: boolean | null
  isSmall: boolean
  stackScale: number
  cardRadius: number
  pointer: { x: MotionValue<number>; y: MotionValue<number> }
  depth: number
}) {
  const flat = reduce === true
  const stackRotate = flat ? 0 : card.stackRotate
  const endX = isSmall ? Math.sign(card.targetSm.x) * 22 : card.target.x
  const endY = isSmall ? card.targetSm.y : card.target.y
  const endRotate = flat || isSmall ? 0 : card.target.rotate
  const restScale = isSmall ? 0.72 : card.target.scale

  // -50% keeps each card centred on its own anchor point
  const translate = useTransform(
    [progress, pointer.x, pointer.y],
    ([p, px, py]: number[]) => {
      const tx = card.stackOffset.x + (endX - card.stackOffset.x) * p
      const ty = card.stackOffset.y + (endY - card.stackOffset.y) * p
      const drift = depth * p
      return `calc(-50% + ${tx - px * PARALLAX_X * drift}vw) calc(-50% + ${ty - py * PARALLAX_Y * drift}vh)`
    }
  )
  const rotate = useTransform(progress, [0, 1], [stackRotate, endRotate])
  const scale = useTransform(progress, [0, 1], [stackScale, restScale])

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 will-change-transform"
      style={{
        width: `${isSmall ? 40 : card.target.w}vw`,
        height: `${isSmall ? 20 : card.target.h}vh`,
        zIndex: card.z,
        translate,
        rotate,
        scale,
      }}
    >
      <div
        className="relative size-full overflow-hidden max-md:rounded-[4vw]"
        style={{ borderRadius: `${cardRadius}px` }}
      >
        <img
          src={card.src}
          alt={card.alt ?? ""}
          aria-hidden={!card.alt}
          draggable={false}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    </motion.div>
  )
}

export function StackSpread({
  cards = CARDS,
  scrollLength = 350,
  heading = "Design that responds.",
  subheading = "Digital products, interfaces and experiences built around people.",
  stackScale = 0.82,
  cardRadius = 8,
  textFadeStart = 0.3,
  showScrollHint = true,
}: {
  cards?: StackSpreadCard[]
  /** scatter distance in vh */
  scrollLength?: number
  heading?: string
  subheading?: string
  /** card scale while still clustered */
  stackScale?: number
  cardRadius?: number
  /** progress at which the centre copy starts fading in */
  textFadeStart?: number
  showScrollHint?: boolean
}) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const isSmall = useCoarsePointer()

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ["start start", "end end"] })

  // hold, scatter, settle
  const progress = useTransform(scrollYProgress, [0, SCATTER_START, SCATTER_END, 1], [0, 0, 1, 1])

  const [spread, setSpread] = React.useState(false)
  useMotionValueEvent(progress, "change", (p) => {
    setSpread((was) => (was ? p > 0.985 : p >= 0.999))
  })

  const parallaxEnabled = reduce !== true && !isSmall
  const pointer = usePointerParallax(spread, parallaxEnabled)

  const copyOpacity = useTransform(progress, [textFadeStart, textFadeStart + 0.35], [0, 1])
  const copyScale = useTransform(progress, [textFadeStart, 0.9], [0.85, 1])
  const hintOpacity = useTransform(progress, [0, SCATTER_START], [1, 0])

  return (
    <section ref={wrapRef} className="relative w-full bg-muted" style={{ height: `${scrollLength}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <motion.div
          className="pointer-events-none absolute inset-0 z-5 flex flex-col items-center justify-center px-6 text-center max-md:px-8"
          style={{ opacity: copyOpacity, scale: reduce === true ? 1 : copyScale }}
        >
          <h2 className="w-full text-[4.5vw] font-normal leading-none! tracking-tight text-foreground max-md:text-[10vw]">
            {heading}
          </h2>
          <p className="mt-[1.2vw] w-full max-w-[42ch] text-[1.15vw] leading-relaxed tracking-tight text-muted-foreground max-md:mt-3 max-md:text-[3.6vw]">
            {subheading}
          </p>
        </motion.div>

        <div className="absolute inset-0 z-10">
          {cards.map((card, i) => (
            <Card
              key={i}
              card={card}
              progress={progress}
              reduce={reduce}
              isSmall={isSmall}
              stackScale={stackScale}
              cardRadius={cardRadius}
              pointer={pointer}
              depth={parallaxEnabled ? depthOf(i, cards.length) : 0}
            />
          ))}
        </div>

        {showScrollHint && (
          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-[3vh] z-20 flex flex-col items-center gap-[0.6vh] text-[0.8vw] font-medium uppercase tracking-[0.2em] text-muted-foreground max-md:bottom-6 max-md:gap-1 max-md:text-[2.8vw]"
            style={{ opacity: hintOpacity }}
          >
            <span>Scroll</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-bounce motion-reduce:animate-none max-md:size-[4vw]"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default StackSpread
