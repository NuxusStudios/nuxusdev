"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react"
import { cn } from "@/lib/utils"

export interface DockItem {
  label: string
  icon: React.ReactNode
  onClick?: () => void
}

export function MacosDock({ items, className }: { items: DockItem[]; className?: string }) {
  const mouseX = useMotionValue(Infinity)

  return (
    <div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto flex h-16 items-end gap-3 rounded-2xl border border-foreground/12 bg-foreground/[0.06] px-3 pb-2.5 backdrop-blur-xl",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_20px_40px_-20px_rgba(0,0,0,0.9)]",
        className
      )}
    >
      {items.map((item) => (
        <DockIcon key={item.label} mouseX={mouseX} {...item} />
      ))}
    </div>
  )
}

function DockIcon({ mouseX, icon, label, onClick }: DockItem & { mouseX: MotionValue<number> }) {
  const ref = React.useRef<HTMLButtonElement>(null)

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const sizeSync = useTransform(distance, [-150, 0, 150], [40, 72, 40])
  const size = useSpring(sizeSync, { mass: 0.1, stiffness: 150, damping: 12 })

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      style={{ width: size, height: size }}
      className="group relative flex aspect-square items-center justify-center rounded-xl border border-foreground/10 bg-foreground/10 text-foreground"
    >
      <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md border border-foreground/10 bg-background/80 px-2 py-1 text-[11px] opacity-0 transition group-hover:opacity-100">
        {label}
      </span>
      {icon}
    </motion.button>
  )
}
