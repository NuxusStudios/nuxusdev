"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!<>-_\\/[]{}—=+*^?#"

/**
 * Decodes text one character at a time, scrambling the ones not yet settled.
 * Runs on mount and again whenever `text` changes.
 */
export function TextScramble({
  text,
  className,
  speed = 28,
  revealEvery = 2,
}: {
  text: string
  className?: string
  speed?: number
  revealEvery?: number
}) {
  const [display, setDisplay] = React.useState(text)

  React.useEffect(() => {
    let frame = 0
    let raf = 0
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let last = performance.now()

    if (reduce) {
      // settle immediately, but off the synchronous effect body
      raf = requestAnimationFrame(() => setDisplay(text))
      return () => cancelAnimationFrame(raf)
    }

    const tick = (now: number) => {
      if (now - last >= speed) {
        last = now
        const settled = Math.floor(frame / revealEvery)

        setDisplay(
          text
            .split("")
            .map((character, index) => {
              if (character === " ") return " "
              if (index < settled) return character
              return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
            })
            .join("")
        )

        frame += 1
        if (settled > text.length) return
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, speed, revealEvery])

  return (
    <span className={cn("font-mono tabular-nums", className)} aria-label={text}>
      {display}
    </span>
  )
}
