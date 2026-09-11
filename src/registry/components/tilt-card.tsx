"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export function TiltCard({
  children,
  className,
  maxTilt = 12,
  glare = true,
}: {
  children: React.ReactNode
  className?: string
  maxTilt?: number
  glare?: boolean
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [style, setStyle] = React.useState<React.CSSProperties>({})
  const [glarePos, setGlarePos] = React.useState({ x: 50, y: 50, o: 0 })

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setStyle({
      transform: `perspective(900px) rotateX(${(0.5 - py) * maxTilt * 2}deg) rotateY(${(px - 0.5) * maxTilt * 2}deg) scale(1.02)`,
    })
    setGlarePos({ x: px * 100, y: py * 100, o: 1 })
  }

  function onLeave() {
    setStyle({ transform: "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)" })
    setGlarePos((g) => ({ ...g, o: 0 }))
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ ...style, transition: "transform 250ms cubic-bezier(0.2,0.8,0.2,1)" }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 will-change-transform",
        className
      )}
    >
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glarePos.o,
            background: `radial-gradient(400px circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.18), transparent 55%)`,
          }}
        />
      )}
      <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
        {children}
      </div>
    </div>
  )
}
