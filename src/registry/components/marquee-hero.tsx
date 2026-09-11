"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&q=80&auto=format&fit=crop",
]

const FADE = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 20 } },
}

/**
 * A centred hero over a marquee of images that drifts along the bottom edge.
 *
 * The strip is duplicated so the loop has no seam, and the whole thing stops
 * moving when the reader has asked for reduced motion.
 */
export function MarqueeHero({
  tagline,
  title,
  description,
  ctaText = "Get started",
  onCtaClick,
  images = DEFAULT_IMAGES,
  className,
}: {
  tagline?: string
  title: React.ReactNode
  description?: string
  ctaText?: string
  onCtaClick?: () => void
  images?: string[]
  className?: string
}) {
  // duplicated so the strip can loop without a visible seam
  const strip = [...images, ...images]

  return (
    <section
      className={cn(
        "relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 text-center",
        className
      )}
    >
      <div className="z-10 flex flex-col items-center">
        {tagline && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={FADE}
            className="mb-4 inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
          >
            {tagline}
          </motion.div>
        )}

        <motion.h1
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          className="text-5xl font-bold tracking-tighter text-foreground md:text-7xl"
        >
          {typeof title === "string"
            ? title.split(" ").map((word, i) => (
                <motion.span key={i} variants={FADE} className="inline-block">
                  {word}&nbsp;
                </motion.span>
              ))
            : title}
        </motion.h1>

        {description && (
          <motion.p
            initial="hidden"
            animate="show"
            variants={FADE}
            transition={{ delay: 0.5 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            {description}
          </motion.p>
        )}

        <motion.div initial="hidden" animate="show" variants={FADE} transition={{ delay: 0.6 }}>
          <button
            type="button"
            onClick={onCtaClick}
            className={cn(
              "mt-8 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-colors",
              "hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            {ctaText}
          </button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 h-1/3 w-full [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] md:h-2/5">
        <motion.div
          className="flex gap-4 motion-reduce:animate-none"
          animate={{ x: ["-100%", "0%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
        >
          {strip.map((src, index) => (
            <div
              key={index}
              className="relative aspect-3/4 h-48 shrink-0 md:h-64"
              style={{ rotate: `${index % 2 === 0 ? -2 : 5}deg` }}
            >
              <img
                src={src}
                alt=""
                aria-hidden
                loading="lazy"
                className="size-full rounded-2xl object-cover shadow-md"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default MarqueeHero
