"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function LiquidGlassButton({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"button">) {
  const ref = React.useRef<HTMLButtonElement>(null)
  const [pos, setPos] = React.useState({ x: 50, y: 50 })

  return (
    <button
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        setPos({
          x: ((e.clientX - r.left) / r.width) * 100,
          y: ((e.clientY - r.top) / r.height) * 100,
        })
      }}
      className={cn(
        "group relative isolate overflow-hidden rounded-full px-8 py-3.5 text-sm font-medium text-white/90",
        "border border-white/20 bg-white/[0.06] backdrop-blur-xl",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_8px_32px_-8px_rgba(0,0,0,0.6)]",
        "transition-all duration-300 hover:border-white/30 hover:text-white active:scale-[0.98]",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(120px circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.22), transparent 60%)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
      <span className="relative z-10">{children}</span>
    </button>
  )
}
