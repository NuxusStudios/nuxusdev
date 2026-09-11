"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

export interface NotificationItem {
  id: string | number
  name: string
  description: string
  icon: string
  color: string
  time: string
}

export function NotificationList({
  items,
  className,
  interval = 2400,
}: {
  items: NotificationItem[]
  className?: string
  interval?: number
}) {
  const [visible, setVisible] = React.useState(items.slice(0, 4))
  const cursor = React.useRef(4)

  React.useEffect(() => {
    const t = setInterval(() => {
      const next = items[cursor.current % items.length]
      cursor.current += 1
      setVisible((cur) => [{ ...next, id: `${next.id}-${cursor.current}` }, ...cur].slice(0, 4))
    }, interval)
    return () => clearInterval(t)
  }, [items, interval])

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-2", className)}>
      <AnimatePresence initial={false}>
        {visible.map((item) => (
          <motion.figure
            key={item.id}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md"
          >
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-xl text-lg"
              style={{ backgroundColor: item.color }}
            >
              {item.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-white">{item.name}</span>
                <span className="text-xs text-white/30">·</span>
                <span className="shrink-0 text-xs text-white/30">{item.time}</span>
              </div>
              <p className="truncate text-sm text-white/45">{item.description}</p>
            </div>
          </motion.figure>
        ))}
      </AnimatePresence>
    </div>
  )
}
