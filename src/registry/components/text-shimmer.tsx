"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function TextShimmer({
  children,
  className,
  duration = 2,
  spread = 2,
}: {
  children: string
  className?: string
  duration?: number
  spread?: number
}) {
  const dynamicSpread = React.useMemo(() => children.length * spread, [children, spread])

  return (
    <span
      style={
        {
          "--spread": `${dynamicSpread}px`,
          "--duration": `${duration}s`,
          backgroundImage:
            "var(--bg), linear-gradient(rgba(255,255,255,0.45), rgba(255,255,255,0.45))",
          "--bg":
            "linear-gradient(90deg, transparent calc(50% - var(--spread)), #fff, transparent calc(50% + var(--spread)))",
        } as React.CSSProperties
      }
      className={cn(
        "relative inline-block bg-[length:250%_100%,auto] bg-clip-text text-transparent",
        "[background-repeat:no-repeat,padding-box] animate-[shimmer-text_var(--duration)_linear_infinite]",
        className
      )}
    >
      {children}
      <style>{`@keyframes shimmer-text { 0% { background-position: 100% center; } 100% { background-position: 0% center; } }`}</style>
    </span>
  )
}
