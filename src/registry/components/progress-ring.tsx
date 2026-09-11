"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  className,
  gradient = ["#38bdf8", "#818cf8"],
}: {
  value: number
  size?: number
  strokeWidth?: number
  label?: string
  className?: string
  gradient?: [string, string]
}) {
  const id = React.useId()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const t = setTimeout(() => setProgress(value), 80)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (progress / 100) * circumference}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.2,0.8,0.2,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-semibold tabular-nums text-foreground">{Math.round(progress)}%</span>
        {label && <span className="text-[11px] text-foreground/40">{label}</span>}
      </div>
    </div>
  )
}
