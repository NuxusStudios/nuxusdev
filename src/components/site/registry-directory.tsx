"use client"

import * as React from "react"
import { ArrowUpRight, Check, Copy, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { ShadcnRegistry } from "@/lib/data/registries"
import { cn } from "@/lib/utils"

type Filter = "all" | "healthy" | "issues"

const STATUS_STYLE: Record<string, string> = {
  healthy: "bg-emerald-500",
  observing: "bg-sky-500",
  degraded: "bg-amber-500",
  unavailable: "bg-rose-500",
  unknown: "bg-muted-foreground/40",
}

const STATUS_LABEL: Record<string, string> = {
  healthy: "Healthy",
  observing: "Observing",
  degraded: "Degraded",
  unavailable: "Unavailable",
  unknown: "Unknown",
}

const PAGE = 60

export function RegistryDirectory({
  registries,
  snapshotAt,
}: {
  registries: ShadcnRegistry[]
  snapshotAt: string
}) {
  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<Filter>("all")
  const [shown, setShown] = React.useState(PAGE)

  const matches = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    return registries.filter((registry) => {
      if (filter === "healthy" && registry.status !== "healthy") return false
      if (filter === "issues" && (registry.status === "healthy" || registry.status === "observing")) {
        return false
      }
      if (!needle) return true
      return (
        registry.namespace.toLowerCase().includes(needle) ||
        registry.description.toLowerCase().includes(needle)
      )
    })
  }, [registries, query, filter])

  // a new search should start at the top of the results, not mid-list
  const visible = matches.slice(0, shown)

  return (
    <div className="mt-7">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setShown(PAGE)
            }}
            placeholder="Search registries…"
            className="pl-9"
            autoComplete="off"
          />
        </div>

        <div className="flex rounded-lg border border-border p-0.5">
          {(["all", "healthy", "issues"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setFilter(value)
                setShown(PAGE)
              }}
              className={cn(
                "rounded-[6px] px-3 py-1.5 text-[13px] font-medium capitalize transition-colors",
                filter === value
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[13px] text-muted-foreground">
        {matches.length} registr{matches.length === 1 ? "y" : "ies"}
        {" · "}
        checked{" "}
        {new Date(snapshotAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </p>

      {matches.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">
          Nothing matched “{query}”.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((registry) => (
            <RegistryCard key={registry.namespace} registry={registry} />
          ))}
        </ul>
      )}

      {shown < matches.length && (
        <div className="mt-8 flex justify-center">
          <Button variant="secondary" onClick={() => setShown((value) => value + PAGE)}>
            Show {Math.min(PAGE, matches.length - shown)} more
          </Button>
        </div>
      )}
    </div>
  )
}

function RegistryCard({ registry }: { registry: ShadcnRegistry }) {
  const [copied, setCopied] = React.useState(false)
  const command = `npx shadcn@latest add ${registry.namespace}/<component>`

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <code className="min-w-0 truncate font-mono text-[15px] font-semibold">
          {registry.namespace}
        </code>
        <span
          className="flex shrink-0 items-center gap-1.5 text-[12px] text-muted-foreground"
          title={
            registry.availability30d === null
              ? STATUS_LABEL[registry.status]
              : `${STATUS_LABEL[registry.status]} · ${registry.availability30d}% uptime over 30 days`
          }
        >
          <span
            className={cn("size-1.5 rounded-full", STATUS_STYLE[registry.status])}
            aria-hidden
          />
          {registry.score === null ? STATUS_LABEL[registry.status] : registry.score}
        </span>
      </div>

      <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
        {registry.description || "No description provided."}
      </p>

      <div className="mt-auto flex items-center gap-2 pt-5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch {
              /* the clipboard can be blocked; the command is visible on hover */
            }
          }}
          title={command}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy install"}
        </Button>

        {registry.homepage && (
          <a
            href={registry.homepage}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="group inline-flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            Website
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
    </li>
  )
}
