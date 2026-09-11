"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** Reveals a paragraph word by word as it scrolls through the viewport. */
export function ScrollRevealText({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  const ref = React.useRef<HTMLParagraphElement>(null)
  const [progress, setProgress] = React.useState(0)
  const words = React.useMemo(() => children.split(" "), [children])

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const rect = el.getBoundingClientRect()
      const start = window.innerHeight * 0.9
      const end = window.innerHeight * 0.25
      const p = (start - rect.top) / (start - end)
      setProgress(Math.min(1, Math.max(0, p)))
    }

    update()
    const scroller = el.closest("[data-scroll-root]") ?? window
    scroller.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      scroller.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <p
      ref={ref}
      className={cn("text-2xl font-medium leading-snug tracking-tight md:text-4xl", className)}
    >
      {words.map((word, i) => {
        const threshold = i / words.length
        const lit = progress > threshold
        return (
          <span
            key={`${word}-${i}`}
            className={cn(
              "transition-colors duration-300",
              lit ? "text-white" : "text-white/15"
            )}
          >
            {word}{" "}
          </span>
        )
      })}
    </p>
  )
}
