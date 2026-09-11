"use client"

import * as React from "react"
import { useInView, useMotionValue, useSpring } from "motion/react"
import { cn } from "@/lib/utils"

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  className,
}: {
  value: number
  direction?: "up" | "down"
  delay?: number
  decimalPlaces?: number
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const motionValue = useMotionValue(direction === "down" ? value : 0)
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 })
  const isInView = useInView(ref, { once: true, margin: "0px" })

  React.useEffect(() => {
    if (!isInView) return
    const t = setTimeout(() => motionValue.set(direction === "down" ? 0 : value), delay * 1000)
    return () => clearTimeout(t)
  }, [motionValue, isInView, delay, value, direction])

  React.useEffect(
    () =>
      springValue.on("change", (latest: number) => {
        if (ref.current) {
          ref.current.textContent = Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(Number(latest.toFixed(decimalPlaces)))
        }
      }),
    [springValue, decimalPlaces]
  )

  return (
    <span
      ref={ref}
      className={cn("inline-block tabular-nums tracking-tight text-foreground", className)}
    >
      0
    </span>
  )
}
