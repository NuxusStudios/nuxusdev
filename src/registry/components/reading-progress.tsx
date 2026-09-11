"use client"

import * as React from "react"
import { motion, useScroll, useSpring } from "motion/react"
import { cn } from "@/lib/utils"

/** Reading-progress bar pinned to the top of its scroll container. */
export function ScrollProgress({
  target,
  className,
  height = 3,
}: {
  target?: React.RefObject<HTMLElement | null>
  className?: string
  height?: number
}) {
  const { scrollYProgress } = useScroll(target ? { container: target } : undefined)
  const scaleX = useSpring(scrollYProgress, { stiffness: 180, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      style={{ scaleX, height }}
      className={cn(
        "sticky top-0 z-50 w-full origin-left bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400",
        className
      )}
    />
  )
}

/** The same progress as a ring — useful in a corner or beside a title. */
export function ScrollProgressRing({
  target,
  size = 44,
  strokeWidth = 3,
}: {
  target?: React.RefObject<HTMLElement | null>
  size?: number
  strokeWidth?: number
}) {
  const { scrollYProgress } = useScroll(target ? { container: target } : undefined)
  const pathLength = useSpring(scrollYProgress, { stiffness: 180, damping: 30 })
  const radius = (size - strokeWidth) / 2

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ pathLength }}
      />
    </svg>
  )
}
