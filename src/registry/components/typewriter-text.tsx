"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function TypewriterText({
  words,
  className,
  typingSpeed = 70,
  deletingSpeed = 40,
  pause = 1400,
  cursorClassName,
}: {
  words: string[]
  className?: string
  typingSpeed?: number
  deletingSpeed?: number
  pause?: number
  cursorClassName?: string
}) {
  const [state, setState] = React.useState({ index: 0, length: 0, deleting: false })
  const word = words[state.index % words.length] ?? ""

  React.useEffect(() => {
    const { length, deleting } = state
    const current = words[state.index % words.length] ?? ""

    // every transition happens on a timer, so the effect never sets state synchronously
    const delay = !deleting && length === current.length ? pause : deleting ? deletingSpeed : typingSpeed

    const timer = setTimeout(() => {
      setState((prev) => {
        const target = words[prev.index % words.length] ?? ""
        if (!prev.deleting && prev.length < target.length) {
          return { ...prev, length: prev.length + 1 }
        }
        if (!prev.deleting) {
          return { ...prev, deleting: true }
        }
        if (prev.length > 0) {
          return { ...prev, length: prev.length - 1 }
        }
        return { index: (prev.index + 1) % words.length, length: 0, deleting: false }
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [state, words, typingSpeed, deletingSpeed, pause])

  return (
    <span className={cn("inline-flex items-center", className)}>
      {word.slice(0, state.length)}
      <span
        className={cn(
          "ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-current align-middle",
          cursorClassName
        )}
      />
    </span>
  )
}
