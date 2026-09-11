"use client"

import { useId } from "react"
import { cn } from "@/lib/utils"

export function DotPattern({
  width = 16,
  height = 16,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  glow = false,
  ...props
}: {
  width?: number
  height?: number
  cx?: number
  cy?: number
  cr?: number
  className?: string
  glow?: boolean
} & React.SVGProps<SVGSVGElement>) {
  const id = useId()

  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full fill-white/25", className)}
      {...props}
    >
      <defs>
        <pattern id={id} width={width} height={height} patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse" x={0} y={0}>
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
        {glow && (
          <radialGradient id={`${id}-glow`}>
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        )}
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  )
}
