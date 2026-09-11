"use client"

import { cn } from "@/lib/utils"

/**
 * A perspective floor receding to a horizon at the vertical midpoint.
 *
 * Perspective lives on the container and the plane is rotated about its top
 * edge, which is what puts the vanishing point inside the element instead of
 * below it. Two repeating gradients, one animated background-position — no
 * canvas, and nothing that touches layout.
 */
export function AnimatedGrid({
  size = 44,
  speed = 6,
  tilt = 72,
  fade = true,
  className,
}: {
  /** grid cell size in pixels */
  size?: number
  /** seconds for one cell of travel */
  speed?: number
  /** floor angle in degrees; higher is flatter */
  tilt?: number
  /** fade the floor out toward the horizon */
  fade?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:260px]",
        className
      )}
      style={
        {
          "--grid-size": `${size}px`,
          "--grid-speed": `${speed}s`,
          "--grid-tilt": `${tilt}deg`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          // starts at the midpoint and runs downward, rotated about its top
          // edge, so the horizon sits at the middle of the element
          "absolute inset-x-[-50%] top-1/2 h-[200%] origin-top",
          "[transform:rotateX(var(--grid-tilt))]",
          "animate-[grid-travel_var(--grid-speed)_linear_infinite]",
          "motion-reduce:animate-none",
          // mixed against the foreground: --color-border alone disappears once
          // the floor is foreshortened
          "[--grid-line:color-mix(in_oklab,var(--color-foreground)_28%,transparent)]",
          "[background-image:linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)]",
          "[background-size:var(--grid-size)_var(--grid-size)]"
        )}
      />

      {fade && (
        <div className="absolute inset-0 [background:linear-gradient(to_bottom,var(--color-background)_35%,transparent_60%,transparent_85%,var(--color-background))]" />
      )}

      <style>{`
        @keyframes grid-travel {
          to { background-position: 0 var(--grid-size); }
        }
      `}</style>
    </div>
  )
}
