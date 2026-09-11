"use client"

import * as React from "react"
import { Check, Copy, Loader2, Lock, Search } from "lucide-react"
import { useCopyGate } from "@/components/site/copy-gate"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn, formatNumber } from "@/lib/utils"

interface IconHit {
  id: string
  set: string
  setName: string
  name: string
}

export interface IconSetInfo {
  id: string
  name: string
  license: string
  url: string
  count: number
}

const PAGE = 120

export function IconSearch({ sets, total }: { sets: IconSetInfo[]; total: number }) {
  const [query, setQuery] = React.useState("")
  const [activeSet, setActiveSet] = React.useState<string | undefined>()
  const [hits, setHits] = React.useState<IconHit[]>([])
  const [matches, setMatches] = React.useState(total)
  const [loading, setLoading] = React.useState(true)
  const [offset, setOffset] = React.useState(0)
  const [copied, setCopied] = React.useState<string | null>(null)

  const { copyText, canCopy } = useCopyGate()

  // reset paging whenever the query or set changes
  React.useEffect(() => {
    setOffset(0)
  }, [query, activeSet])

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)

    const timer = setTimeout(async () => {
      const params = new URLSearchParams({ q: query, limit: String(PAGE), offset: String(offset) })
      if (activeSet) params.set("set", activeSet)

      const response = await fetch(`/api/icons?${params}`)
      const data = (await response.json()) as { hits: IconHit[]; total: number }

      if (cancelled) return
      setHits((current) => (offset === 0 ? data.hits : [...current, ...data.hits]))
      setMatches(data.total)
      setLoading(false)
    }, 160)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, activeSet, offset])

  async function copy(hit: IconHit) {
    const snippet = `<img src="https://api.iconify.design/${hit.set}/${hit.name}.svg" alt="${hit.name}" className="size-4" />`
    const ok = await copyText(snippet, `${hit.set}:${hit.name}`)
    if (!ok) return
    setCopied(hit.id)
    setTimeout(() => setCopied(null), 1400)
  }

  return (
    <div className="mt-8">
      <div className="sticky top-14 z-10 -mx-4 bg-background/90 px-4 py-4 backdrop-blur-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${formatNumber(total)} icons — try "arrow", "github", "calendar"`}
            className="h-11 pl-10 text-[15px]"
          />
        </div>

        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
          <SetChip
            label="All sets"
            count={total}
            active={!activeSet}
            onClick={() => setActiveSet(undefined)}
          />
          {sets.map((set) => (
            <SetChip
              key={set.id}
              label={set.name}
              count={set.count}
              active={activeSet === set.id}
              onClick={() => setActiveSet(set.id)}
            />
          ))}
        </div>

        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {!canCopy && <Lock className="size-3" />}
          {loading && offset === 0 ? (
            "Searching…"
          ) : (
            <>
              {formatNumber(matches)} {query ? "matches" : "icons"}
              {!canCopy && " · copying needs a plan"}
            </>
          )}
        </p>
      </div>

      {hits.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-border px-8 py-20 text-center">
          <p className="text-sm font-medium">No icons for “{query}”</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a shorter word, or a different set.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
          {hits.map((hit) => (
            <button
              key={hit.id}
              onClick={() => copy(hit)}
              title={`${hit.setName} · ${hit.name}`}
              className={cn(
                "group flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-card transition-colors",
                "hover:border-border-strong hover:bg-accent"
              )}
            >
              {copied === hit.id ? (
                <Check className="size-5 text-emerald-400" />
              ) : (
                // rendered by the API so the browser never downloads 42,000 icons
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/icons?id=${encodeURIComponent(hit.id)}`}
                  alt={hit.name}
                  loading="lazy"
                  width={22}
                  height={22}
                  className="size-[22px] opacity-80 transition-opacity group-hover:opacity-100 [filter:invert(1)] dark:[filter:none]"
                  style={{ filter: "none", color: "inherit" }}
                />
              )}
              <span className="w-full truncate px-1.5 text-[9.5px] leading-none text-muted-foreground/60">
                {hit.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {hits.length < matches && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => setOffset((current) => current + PAGE)}
            className="gap-2"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}

      <div className="mt-14 border-t border-border pt-6">
        <h2 className="text-[13px] font-semibold">Sets and licenses</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Every set here is open source. Check each licence before shipping —
          brand marks in particular carry trademark rules of their own.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {sets.map((set) => (
            <li key={set.id} className="rounded-lg border border-border px-3 py-2.5">
              <a
                href={set.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[13px] font-medium transition-colors hover:text-brand"
              >
                {set.name}
              </a>
              <p className="text-xs text-muted-foreground">
                {formatNumber(set.count)} icons · {set.license}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function SetChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[13px] transition-colors",
        active
          ? "border-border-strong bg-secondary text-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <span className="ml-1.5 text-[11px] tabular-nums text-muted-foreground/60">
        {formatNumber(count)}
      </span>
    </button>
  )
}
