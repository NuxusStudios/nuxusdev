"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToolbarItem {
  id: string
  label: string
  icon: React.ReactNode
}

export interface ToolbarGroup {
  id: string
  items: ToolbarItem[]
  /** single = radio behaviour, multiple = independent toggles */
  mode?: "single" | "multiple"
}

/** Editor-style toolbar with grouped toggles and keyboard-reachable buttons. */
export function Toolbar({
  groups,
  className,
}: {
  groups: ToolbarGroup[]
  className?: string
}) {
  const [state, setState] = React.useState<Record<string, string[]>>(() =>
    Object.fromEntries(groups.map((group) => [group.id, group.mode === "single" ? [group.items[0].id] : []]))
  )

  const toggle = (group: ToolbarGroup, itemId: string) => {
    setState((current) => {
      const active = current[group.id] ?? []
      if (group.mode === "single") return { ...current, [group.id]: [itemId] }
      return {
        ...current,
        [group.id]: active.includes(itemId)
          ? active.filter((id) => id !== itemId)
          : [...active, itemId],
      }
    })
  }

  return (
    <div
      role="toolbar"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-white/12 bg-white/[0.04] p-1 backdrop-blur-xl",
        className
      )}
    >
      {groups.map((group, groupIndex) => (
        <React.Fragment key={group.id}>
          {groupIndex > 0 && <span className="mx-0.5 h-6 w-px bg-white/10" />}
          {group.items.map((item) => {
            const active = (state[group.id] ?? []).includes(item.id)
            return (
              <button
                key={item.id}
                onClick={() => toggle(group, item.id)}
                aria-pressed={active}
                title={item.label}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-white text-black" : "text-white/55 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.icon}
              </button>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )
}
