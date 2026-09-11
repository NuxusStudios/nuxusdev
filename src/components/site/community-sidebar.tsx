"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bug, ChevronRight } from "lucide-react"
import { Logo } from "@/components/site/logo"
import { TAGS, tagHref } from "@/lib/data/tags"
import { cn, formatNumber } from "@/lib/utils"

const PRIMARY = [
  { label: "Featured", href: "/community/components/featured" },
  { label: "Newest", href: "/community/components/newest" },
  { label: "Authors", href: "/community/authors" },
  { label: "Libraries", href: "/community/libraries" },
  { label: "Updated", href: "/community/components/updated" },
]

export function CommunitySidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const marketing = TAGS.filter((t) => t.group === "marketing")
  const ui = TAGS.filter((t) => t.group === "ui")

  return (
    <aside
      className={cn(
        "flex h-full w-[248px] shrink-0 flex-col border-r border-border bg-background",
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
        <Logo wordmark={false} />
        <span className="text-sm font-medium">Components</span>
        <span className="text-muted-foreground/50">/</span>
      </div>

      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-3">
        <ul className="mb-5 space-y-0.5">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "block rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                  pathname === item.href
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <SidebarGroup title="Marketing Blocks" tags={marketing} pathname={pathname} />
        <SidebarGroup title="UI Components" tags={ui} pathname={pathname} />
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="flex items-center gap-2 text-[13px] font-medium">
            <Bug className="size-4 text-brand" />
            Design Bug Bot
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Catch UI issues in pull requests and get code to fix them.
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground/70">
            5 free reviews in your first week on a paid plan.
          </p>
          <Link
            href="/design-bug-bot"
            className="mt-3 flex h-8 items-center justify-center gap-1 rounded-lg bg-foreground text-[13px] font-medium text-background transition hover:bg-foreground/90"
          >
            Add Bug Bot
          </Link>
          <Link
            href="/blog/introducing-design-bug-bot"
            className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted-foreground transition hover:text-foreground"
          >
            Read the announcement <ChevronRight className="size-3" />
          </Link>
        </div>
      </div>
    </aside>
  )
}

function SidebarGroup({
  title,
  tags,
  pathname,
}: {
  title: string
  tags: typeof TAGS
  pathname: string
}) {
  return (
    <div className="mb-5">
      <h3 className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
        {title}
      </h3>
      <ul className="space-y-0.5">
        {tags.map((tag) => {
          const href = tagHref(tag)
          const active = pathname === href
          return (
            <li key={tag.slug}>
              <Link
                href={href}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                  active
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <span className="truncate">{tag.name}</span>
                {tag.badge === "new" ? (
                  <span className="shrink-0 rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                    New
                  </span>
                ) : (
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/50">
                    {formatNumber(tag.count)}
                  </span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
