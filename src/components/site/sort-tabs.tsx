"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { SortKey } from "@/lib/queries"

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "popular", label: "Popular" },
  { key: "newest", label: "Newest" },
  { key: "installs", label: "Most installed" },
]

export function SortTabs({ basePath, active }: { basePath: string; active: SortKey }) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-secondary/40 p-0.5">
      {OPTIONS.map((opt) => (
        <Link
          key={opt.key}
          href={opt.key === "featured" ? basePath : `${basePath}?sort=${opt.key}`}
          scroll={false}
          className={cn(
            "rounded-md px-2.5 py-1 text-[13px] transition-colors",
            active === opt.key
              ? "bg-background font-medium text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  )
}
