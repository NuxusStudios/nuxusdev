"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { cn } from "@/lib/utils"

/**
 * Button that leans toward the cursor while it's nearby, and springs back when
 * the pointer leaves. The label moves further than the button for depth.
 */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & { strength?: number }) {
  const ref = React.useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const springY = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  const labelX = useTransform(springX, (value) => value * 0.45)
  const labelY = useTransform(springY, (value) => value * 0.45)

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={(event) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        x.set((event.clientX - (rect.left + rect.width / 2)) * strength)
        y.set((event.clientY - (rect.top + rect.height / 2)) * strength)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className={cn(
        "relative inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background",
        className
      )}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      <motion.span style={{ x: labelX, y: labelY }} className="relative z-10">
        {children}
      </motion.span>
    </motion.button>
  )
}
