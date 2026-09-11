"use client"

import * as React from "react"
import Image from "next/image"
import { motion, useMotionValue } from "motion/react"
import { cn } from "@/lib/utils"

const ONE_SECOND = 1000
const AUTO_DELAY = ONE_SECOND * 5
/** how far the pointer must travel before a drag counts as a slide change */
const DRAG_BUFFER = 50

const SPRING = { type: "spring" as const, mass: 3, stiffness: 400, damping: 50 }

const ACTIVE_SCALE = 0.95
const INACTIVE_SCALE = 0.85

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80&auto=format&fit=crop",
]

/**
 * A draggable carousel with a thumbnail strip.
 *
 * Advances on its own until the reader touches it, and stops advancing
 * entirely when the system asks for reduced motion — an image that changes
 * under you is exactly what that setting is for.
 */
export function ThumbnailCarousel({
  images = DEFAULT_IMAGES,
  autoAdvance = true,
  className,
}: {
  images?: string[]
  autoAdvance?: boolean
  className?: string
}) {
  const [index, setIndex] = React.useState(0)
  const dragX = useMotionValue(0)

  const reduced = useReducedMotion()

  React.useEffect(() => {
    if (!autoAdvance || reduced || images.length < 2) return

    const timer = setInterval(() => {
      // a drag in progress owns the carousel; don't yank it away
      if (dragX.get() !== 0) return
      setIndex((current) => (current === images.length - 1 ? 0 : current + 1))
    }, AUTO_DELAY)

    return () => clearInterval(timer)
  }, [dragX, autoAdvance, reduced, images.length])

  function onDragEnd() {
    const x = dragX.get()
    if (x <= -DRAG_BUFFER && index < images.length - 1) setIndex(index + 1)
    else if (x >= DRAG_BUFFER && index > 0) setIndex(index - 1)
  }

  return (
    <div className={cn("flex select-none items-center justify-center overflow-hidden py-2", className)}>
      <div className="relative w-[320px] py-4 sm:w-[384px]">
        <div className="relative overflow-hidden">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            style={{ x: dragX }}
            animate={{ translateX: `-${index * 100}%` }}
            transition={reduced ? { duration: 0 } : SPRING}
            onDragEnd={onDragEnd}
            className="flex"
          >
            {images.map((src, i) => (
              <motion.div
                key={src}
                animate={{ scale: i === index ? ACTIVE_SCALE : INACTIVE_SCALE }}
                transition={reduced ? { duration: 0 } : SPRING}
                className="relative h-[320px] w-[320px] shrink-0 overflow-hidden rounded-2xl shadow-md sm:h-[384px] sm:w-[384px] dark:shadow-2xl"
              >
                <Image
                  src={src}
                  alt={`Slide ${i + 1} of ${images.length}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 320px, 384px"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 overflow-x-auto overflow-y-visible p-1 pb-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative size-11 shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all duration-300 sm:size-13",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                "motion-reduce:transition-none",
                i === index
                  ? "scale-110 opacity-100 shadow-md ring-2 ring-foreground/60"
                  : "opacity-60 hover:opacity-90"
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="52px" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Reads the setting once and follows it if the reader changes their mind. */
function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (callback) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)")
      query.addEventListener("change", callback)
      return () => query.removeEventListener("change", callback)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
}

export default ThumbnailCarousel
