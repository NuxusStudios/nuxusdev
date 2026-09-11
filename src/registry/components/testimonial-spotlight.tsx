"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Spotlight {
  quote: string
  name: string
  role: string
  color?: string
}

/** One large quote at a time, with the speakers as clickable avatars. */
export function TestimonialSpotlight({
  testimonials,
  interval = 6000,
  className,
}: {
  testimonials: Spotlight[]
  interval?: number
  className?: string
}) {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % testimonials.length), interval)
    return () => clearInterval(timer)
  }, [testimonials.length, interval, index])

  const active = testimonials[index]

  return (
    <div className={cn("mx-auto max-w-2xl px-6 text-center", className)}>
      <Quote className="mx-auto size-7 text-foreground/15" />

      <div className="relative mt-6 min-h-[9rem]">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl font-medium leading-relaxed tracking-tight text-foreground md:text-2xl"
          >
            “{active.quote}”
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-center gap-3">
        {testimonials.map((person, i) => (
          <button
            key={person.name}
            onClick={() => setIndex(i)}
            aria-label={person.name}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border-2 text-[11px] font-semibold text-foreground transition-all",
              i === index ? "scale-110 border-foreground" : "border-transparent opacity-40 hover:opacity-80"
            )}
            style={{ background: person.color ?? "rgba(255,255,255,0.12)" }}
          >
            {person.name.slice(0, 2).toUpperCase()}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm">
        <span className="font-medium text-foreground">{active.name}</span>
        <span className="text-foreground/40"> · {active.role}</span>
      </p>
    </div>
  )
}
