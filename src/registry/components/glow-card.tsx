"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A card whose border lights up where the pointer is — the glow lives on a
 * pseudo-parent so a grid of these shares one listener per card.
 */
export function GlowCard({
  children,
  className,
  glowColor = "rgba(0, 143, 233, 0.65)",
}: {
  children: React.ReactNode
  className?: string
  glowColor?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty("--x", `${e.clientX - rect.left}px`)
    el.style.setProperty("--y", `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      style={{ ["--glow" as string]: glowColor }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white/[0.03] p-px",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl",
        "before:bg-[radial-gradient(240px_circle_at_var(--x,50%)_var(--y,50%),var(--glow),transparent_65%)]",
        "before:opacity-0 before:transition-opacity before:duration-300 group-hover:before:opacity-100",
        "ring-1 ring-inset ring-white/10",
        className
      )}
    >
      <div className="relative h-full rounded-[15px] bg-[#0c0c10] p-6">{children}</div>
    </div>
  )
}
