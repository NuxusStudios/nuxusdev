"use client"

import * as React from "react"
import { ArrowRight, CornerDownLeft, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CommandItem {
  group: string
  label: string
  hint?: string
  icon?: React.ReactNode
}

export function CommandPalette({
  items,
  placeholder = "Type a command or search…",
  className,
}: {
  items: CommandItem[]
  placeholder?: string
  className?: string
}) {
  const [query, setQuery] = React.useState("")
  const [selection, setSelection] = React.useState({ query: "", index: 0 })

  // a new query resets the highlight without an effect
  const active = selection.query === query ? selection.index : 0
  const setActive = React.useCallback(
    (index: number | ((current: number) => number)) =>
      setSelection((prev) => {
        const current = prev.query === query ? prev.index : 0
        return { query, index: typeof index === "function" ? index(current) : index }
      }),
    [query]
  )

  const filtered = React.useMemo(
    () => items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  )

  const groups = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    filtered.forEach((i) => map.set(i.group, [...(map.get(i.group) ?? []), i]))
    return [...map.entries()]
  }, [filtered])

  let flatIndex = -1

  return (
    <div
      className={cn(
        "w-full max-w-lg overflow-hidden rounded-2xl border border-foreground/12 bg-card/95 shadow-[0_40px_100px_-30px_rgba(0,0,0,1)] backdrop-blur-xl",
        className
      )}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, filtered.length - 1))
        if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0))
      }}
    >
      <div className="flex items-center gap-3 border-b border-foreground/10 px-4">
        <Search className="size-4 shrink-0 text-foreground/30" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/25"
        />
        <kbd className="shrink-0 rounded border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 font-mono text-[10px] text-foreground/40">
          ESC
        </kbd>
      </div>

      <div className="max-h-72 overflow-y-auto p-2">
        {groups.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-foreground/30">No results for “{query}”</p>
        )}
        {groups.map(([group, groupItems]) => (
          <div key={group} className="mb-1">
            <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-foreground/25">
              {group}
            </p>
            {groupItems.map((item) => {
              flatIndex += 1
              const isActive = flatIndex === active
              return (
                <button
                  key={item.label}
                  onMouseEnter={() => setActive(filtered.indexOf(item))}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition",
                    isActive ? "bg-foreground/10 text-foreground" : "text-foreground/60"
                  )}
                >
                  <span className="text-foreground/40">{item.icon ?? <ArrowRight className="size-4" />}</span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && <span className="text-xs text-foreground/25">{item.hint}</span>}
                  {isActive && <CornerDownLeft className="size-3.5 text-foreground/40" />}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
