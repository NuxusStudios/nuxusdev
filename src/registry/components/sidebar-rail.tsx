"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface RailItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

/** Narrow icon rail with tooltips — the shell most dashboards start from. */
export function SidebarRail({
  items,
  footer,
  className,
}: {
  items: RailItem[]
  footer?: RailItem[]
  className?: string
}) {
  const [active, setActive] = React.useState(items[0]?.id)

  const renderItem = (item: RailItem) => {
    const isActive = item.id === active
    return (
      <button
        key={item.id}
        onClick={() => setActive(item.id)}
        aria-current={isActive}
        className={cn(
          "group relative flex size-11 items-center justify-center rounded-xl transition-colors",
          isActive ? "bg-white/12 text-white" : "text-white/45 hover:bg-white/8 hover:text-white"
        )}
      >
        {isActive && (
          <span className="absolute -left-2 h-5 w-1 rounded-full bg-white" aria-hidden />
        )}
        {item.icon}

        {typeof item.badge === "number" && item.badge > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {item.badge > 9 ? "9+" : item.badge}
          </span>
        )}

        <span className="pointer-events-none absolute left-full z-20 ml-3 whitespace-nowrap rounded-lg border border-white/10 bg-black/90 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
          {item.label}
        </span>
      </button>
    )
  }

  return (
    <aside
      className={cn(
        "flex h-full w-16 flex-col items-center gap-1 border-r border-white/10 bg-zinc-950 py-4",
        className
      )}
    >
      {items.map(renderItem)}
      {footer && (
        <>
          <span className="mt-auto" />
          {footer.map(renderItem)}
        </>
      )}
    </aside>
  )
}
