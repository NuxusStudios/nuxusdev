"use client"

import * as React from "react"
import { ArrowUpRight, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { APP_CATEGORIES, type AppCategory, type OpenSourceApp } from "@/lib/data/apps"
import { cn } from "@/lib/utils"

type Sort = "stars" | "recent" | "name"

const SORTS: { id: Sort; label: string }[] = [
  { id: "stars", label: "Most stars" },
  { id: "recent", label: "Recently updated" },
  { id: "name", label: "A–Z" },
]

/**
 * Open-source apps worth reading.
 *
 * Everything shown comes from the GitHub API — the description, the star
 * count, the licence — so nothing here is a claim we made up, and a repo that
 * goes quiet shows it in the date rather than sitting at a stale number.
 */
export function AppsDirectory({ apps }: { apps: OpenSourceApp[] }) {
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<AppCategory | "all">("all")
  const [sort, setSort] = React.useState<Sort>("stars")

  const shown = React.useMemo(() => {
    const needle = query.trim().toLowerCase()

    const filtered = apps.filter((app) => {
      if (category !== "all" && app.category !== category) return false
      if (!needle) return true
      return (
        app.name.toLowerCase().includes(needle) ||
        app.description.toLowerCase().includes(needle) ||
        app.repo.toLowerCase().includes(needle) ||
        app.topics.some((topic) => topic.includes(needle))
      )
    })

    return filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name)
      if (sort === "recent") return b.updatedAt.localeCompare(a.updatedAt)
      return b.stars - a.stars
    })
  }, [apps, category, query, sort])

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search apps…"
          className="min-w-[16rem] flex-1"
          autoComplete="off"
          aria-label="Search open-source apps"
        />

        <div className="flex rounded-lg border border-border p-0.5">
          {SORTS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSort(option.id)}
              aria-pressed={sort === option.id}
              className={cn(
                "rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                sort === option.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <CategoryChip active={category === "all"} onClick={() => setCategory("all")}>
          All
        </CategoryChip>
        {APP_CATEGORIES.map((entry) => (
          <CategoryChip
            key={entry.id}
            active={category === entry.id}
            onClick={() => setCategory(entry.id)}
          >
            {entry.label}
          </CategoryChip>
        ))}
      </div>

      <p className="mt-4 text-[13px] text-muted-foreground">
        {shown.length} app{shown.length === 1 ? "" : "s"}
      </p>

      {shown.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">Nothing matched “{query}”.</p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((app) => (
            <AppCard key={app.repo} app={app} />
          ))}
        </ul>
      )}
    </div>
  )
}

function CategoryChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-[13px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-foreground/30 bg-foreground/10 text-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function AppCard({ app }: { app: OpenSourceApp }) {
  return (
    <li className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 truncate text-[15px] font-semibold">{app.name}</h3>
        <span className="flex shrink-0 items-center gap-1 text-[12px] tabular-nums text-muted-foreground">
          <Star className="size-3.5" />
          {formatStars(app.stars)}
        </span>
      </div>

      <p className="mt-0.5 truncate font-mono text-[12px] text-muted-foreground">{app.repo}</p>

      {app.description && (
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
          {app.description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {app.language && (
          <span className="rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {app.language}
          </span>
        )}
        {app.license && app.license !== "NOASSERTION" && (
          <span className="rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {app.license}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center gap-3 pt-5 text-[13px]">
        <a
          href={`https://github.com/${app.repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          Source
          <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
        {app.homepage && (
          <a
            href={app.homepage}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            Website
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
    </li>
  )
}

function formatStars(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`
  return String(count)
}
