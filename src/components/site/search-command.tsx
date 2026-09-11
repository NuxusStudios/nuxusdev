"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { Boxes, Layers, Search, Tag, User } from "lucide-react"
import { cn, formatCount } from "@/lib/utils"
import { BRAND } from "@/lib/brand"

interface SearchResults {
  components: { id: string; name: string; href: string; author: string; bookmarks: number }[]
  authors: { handle: string; name: string; href: string; count: number }[]
  libraries: { slug: string; name: string; href: string; count: number }[]
  tags: { slug: string; name: string; href: string; count: number }[]
}

const EMPTY: SearchResults = { components: [], authors: [], libraries: [], tags: [] }

export function SearchCommand({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResults>(EMPTY)
  const [loading, setLoading] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])

  React.useEffect(() => {
    if (!open) return
    let cancelled = false
    const t = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = (await res.json()) as SearchResults
      if (!cancelled) {
        setResults(data)
        setLoading(false)
      }
    }, 120)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [query, open])

  const go = (href: string) => {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const empty =
    !loading &&
    !results.components.length &&
    !results.authors.length &&
    !results.libraries.length &&
    !results.tags.length

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-8 w-full max-w-[260px] items-center gap-2 rounded-lg border border-border bg-secondary/40 px-2.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:bg-secondary/70",
          className
        )}
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Search</span>
        <kbd className="rounded border border-border bg-background/60 px-1.5 font-mono text-[10px]">
          K
        </kbd>
      </button>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label={`Search ${BRAND.name}`}
        shouldFilter={false}
        className="fixed left-1/2 top-[15vh] z-50 w-[min(94vw,600px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-black/60"
        overlayClassName="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px]"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Command.Input
            value={query}
            onValueChange={(value) => {
              setLoading(true)
              setQuery(value)
            }}
            placeholder="Search components, authors, libraries…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          <kbd className="shrink-0 rounded border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[380px] overflow-y-auto p-2">
          {empty && (
            <Command.Empty className="px-3 py-10 text-center text-sm text-muted-foreground">
              No results for “{query}”
            </Command.Empty>
          )}

          {results.components.length > 0 && (
            <Group heading="Components">
              {results.components.map((c) => (
                <Item key={c.id} onSelect={() => go(c.href)} icon={<Boxes className="size-4" />}>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.author}</span>
                  <span className="w-10 text-right text-xs tabular-nums text-muted-foreground/70">
                    {formatCount(c.bookmarks)}
                  </span>
                </Item>
              ))}
            </Group>
          )}

          {results.authors.length > 0 && (
            <Group heading="Authors">
              {results.authors.map((a) => (
                <Item key={a.handle} onSelect={() => go(a.href)} icon={<User className="size-4" />}>
                  <span className="flex-1 truncate">{a.name}</span>
                  <span className="text-xs text-muted-foreground">@{a.handle}</span>
                </Item>
              ))}
            </Group>
          )}

          {results.libraries.length > 0 && (
            <Group heading="Libraries">
              {results.libraries.map((l) => (
                <Item key={l.slug} onSelect={() => go(l.href)} icon={<Layers className="size-4" />}>
                  <span className="flex-1 truncate">{l.name}</span>
                  <span className="text-xs text-muted-foreground">{l.count} components</span>
                </Item>
              ))}
            </Group>
          )}

          {results.tags.length > 0 && (
            <Group heading="Categories">
              {results.tags.map((t) => (
                <Item key={t.slug} onSelect={() => go(t.href)} icon={<Tag className="size-4" />}>
                  <span className="flex-1 truncate">{t.name}</span>
                </Item>
              ))}
            </Group>
          )}
        </Command.List>
      </Command.Dialog>
    </>
  )
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="mb-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground/60"
    >
      {children}
    </Command.Group>
  )
}

function Item({
  children,
  onSelect,
  icon,
}: {
  children: React.ReactNode
  onSelect: () => void
  icon: React.ReactNode
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors data-[selected=true]:bg-accent data-[selected=true]:text-foreground"
    >
      <span className="text-muted-foreground/70">{icon}</span>
      {children}
    </Command.Item>
  )
}
