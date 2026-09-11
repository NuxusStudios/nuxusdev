"use client"

import * as React from "react"
import { ChevronsLeft, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SidebarItem {
  label: string
  icon: LucideIcon
  badge?: string | number
  active?: boolean
}

export function CollapsibleSidebar({
  items,
  brand = "Acme",
  footer,
  className,
}: {
  items: SidebarItem[]
  brand?: string
  footer?: React.ReactNode
  className?: string
}) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-foreground/10 bg-card transition-[width] duration-300 ease-out",
        collapsed ? "w-[68px]" : "w-[232px]",
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2.5 px-4">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
          {brand.slice(0, 1)}
        </span>
        {!collapsed && (
          <span className="truncate text-sm font-semibold text-foreground">{brand}</span>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 px-2.5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                item.active
                  ? "bg-foreground/10 text-foreground"
                  : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="shrink-0 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10.5px] tabular-nums text-foreground/60">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-foreground/10 p-2.5">
        {!collapsed && footer}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] text-foreground/40 transition hover:bg-foreground/5 hover:text-foreground"
        >
          <ChevronsLeft className={cn("size-4 shrink-0 transition-transform", collapsed && "rotate-180")} />
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  )
}
