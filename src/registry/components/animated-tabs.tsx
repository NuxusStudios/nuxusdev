"use client"

import * as React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export function AnimatedTabs({
  tabs,
  defaultValue,
  className,
  onChange,
}: {
  tabs: { value: string; label: string }[]
  defaultValue?: string
  className?: string
  onChange?: (value: string) => void
}) {
  const [active, setActive] = React.useState(defaultValue ?? tabs[0]?.value)
  const id = React.useId()

  return (
    <div className={cn("inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1", className)}>
      {tabs.map((tab) => {
        const isActive = tab.value === active
        return (
          <button
            key={tab.value}
            onClick={() => {
              setActive(tab.value)
              onChange?.(tab.value)
            }}
            className={cn(
              "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              isActive ? "text-black" : "text-white/55 hover:text-white"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={`tab-pill-${id}`}
                className="absolute inset-0 rounded-full bg-white"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}
