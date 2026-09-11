"use client"

import * as React from "react"
import * as Lucide from "lucide-react"
import { Check, Copy, Lock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useCopyGate } from "@/components/site/copy-gate"
import { cn, formatNumber } from "@/lib/utils"

/** "meaning" aliases so a search for a concept finds the right glyph */
const ALIASES: Record<string, string[]> = {
  delete: ["trash", "x", "eraser"],
  remove: ["trash", "minus", "x"],
  add: ["plus", "circle-plus", "square-plus"],
  save: ["bookmark", "save", "hard-drive", "download"],
  edit: ["pencil", "pen", "square-pen"],
  user: ["user", "users", "circle-user", "contact"],
  money: ["dollar", "banknote", "credit-card", "wallet", "coins"],
  chart: ["chart", "trending", "activity"],
  time: ["clock", "timer", "hourglass", "calendar"],
  send: ["send", "arrow-up", "share", "mail"],
  warning: ["triangle-alert", "octagon-alert", "shield-alert"],
  success: ["check", "circle-check", "badge-check"],
  settings: ["settings", "sliders", "wrench", "cog"],
  search: ["search", "scan", "telescope"],
  security: ["lock", "shield", "key", "fingerprint"],
  ai: ["sparkles", "brain", "bot", "wand"],
}

function toKebab(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

export function IconSearch() {
  const [query, setQuery] = React.useState("")
  const [copied, setCopied] = React.useState<string | null>(null)
  const { copyText, canCopy } = useCopyGate()
  const [paging, setPaging] = React.useState({ query: "", limit: 180 })

  // a new query starts a fresh page without an effect
  const limit = paging.query === query ? paging.limit : 180
  const showMore = React.useCallback(
    (by: number) => setPaging((prev) => ({ query, limit: (prev.query === query ? prev.limit : 180) + by })),
    [query]
  )

  const all = React.useMemo(() => {
    return Object.entries(Lucide)
      .filter(
        ([name, value]) =>
          /^[A-Z]/.test(name) &&
          !name.endsWith("Icon") &&
          !["createLucideIcon", "Icon"].includes(name) &&
          typeof value === "object"
      )
      .map(([name, Component]) => ({
        name,
        kebab: toKebab(name),
        Component: Component as React.ComponentType<{ className?: string }>,
      }))
  }, [])

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    const expanded = [q, ...(ALIASES[q] ?? [])]
    return all.filter((icon) => expanded.some((term) => icon.kebab.includes(term)))
  }, [all, query])

  async function copy(name: string) {
    const ok = await copyText(`<${name} className="size-4" />`, `<${name} />`)
    if (!ok) return
    setCopied(name)
    setTimeout(() => setCopied(null), 1400)
  }

  return (
    <div className="mt-8">
      <div className="sticky top-16 z-10 -mx-1 bg-background/90 px-1 py-2 backdrop-blur">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or meaning — try “delete” or “ai”"
            className="h-10 pl-9"
          />
        </div>
        <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          {!canCopy && <Lock className="size-3" />}
          {formatNumber(results.length)} icons
          {query && ALIASES[query.trim().toLowerCase()] && " · expanded by meaning"}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-10 xl:grid-cols-12">
        {results.slice(0, limit).map(({ name, Component }) => (
          <button
            key={name}
            onClick={() => copy(name)}
            title={name}
            className={cn(
              "group flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card/50 transition-colors",
              "hover:border-border-strong hover:bg-accent"
            )}
          >
            {copied === name ? (
              <Check className="size-5 text-emerald-400" />
            ) : (
              <Component className="size-5 text-foreground/80" />
            )}
            <span className="w-full truncate px-1 text-[9.5px] text-muted-foreground/70">
              {name}
            </span>
          </button>
        ))}
      </div>

      {results.length > limit && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => showMore(240)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-[13px] transition-colors hover:border-border-strong hover:bg-accent"
          >
            <Copy className="size-3.5" />
            Show more ({formatNumber(results.length - limit)} left)
          </button>
        </div>
      )}

      {results.length === 0 && (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Nothing matches “{query}”.
        </p>
      )}
    </div>
  )
}
