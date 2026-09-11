"use client"

import * as React from "react"
import { ArrowUpDown, MoreHorizontal, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  key: keyof T & string
  header: string
  align?: "left" | "right"
  render?: (row: T) => React.ReactNode
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  searchKey,
  className,
}: {
  columns: Column<T>[]
  rows: T[]
  searchKey?: keyof T & string
  className?: string
}) {
  const [query, setQuery] = React.useState("")
  const [sort, setSort] = React.useState<{ key: string; dir: 1 | -1 } | null>(null)

  const filtered = React.useMemo(() => {
    let out = rows
    if (query && searchKey) {
      out = out.filter((r) => String(r[searchKey]).toLowerCase().includes(query.toLowerCase()))
    }
    if (sort) {
      out = [...out].sort((a, b) => {
        const av = a[sort.key] as string | number
        const bv = b[sort.key] as string | number
        return av > bv ? sort.dir : av < bv ? -sort.dir : 0
      })
    }
    return out
  }, [rows, query, searchKey, sort])

  return (
    <div className={cn("w-full overflow-hidden rounded-xl border border-foreground/10 bg-foreground/[0.02]", className)}>
      {searchKey && (
        <div className="flex items-center gap-2 border-b border-foreground/10 px-3 py-2.5">
          <Search className="size-4 text-foreground/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground/25"
          />
          <span className="shrink-0 text-xs text-foreground/30">{filtered.length} rows</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/10 text-left">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn("px-4 py-2.5 text-xs font-medium text-foreground/40", c.align === "right" && "text-right")}
                >
                  <button
                    onClick={() =>
                      setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 }))
                    }
                    className="inline-flex items-center gap-1 transition hover:text-foreground"
                  >
                    {c.header}
                    <ArrowUpDown className="size-3 opacity-50" />
                  </button>
                </th>
              ))}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} className="border-b border-foreground/5 transition-colors last:border-0 hover:bg-foreground/[0.03]">
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn("px-4 py-2.5 text-foreground/75", c.align === "right" && "text-right tabular-nums")}
                  >
                    {c.render ? c.render(row) : String(row[c.key])}
                  </td>
                ))}
                <td className="px-2 text-right">
                  <button className="rounded-md p-1 text-foreground/30 transition hover:bg-foreground/10 hover:text-foreground">
                    <MoreHorizontal className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
