"use client"

import * as React from "react"
import { Check, Minus, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type CompareValue = boolean | "partial" | string

export interface CompareColumn {
  id: string
  name: string
  note?: string
  /** Marks the column as yours: highlighted, and never hidden on narrow screens. */
  ours?: boolean
}

export interface CompareRow {
  feature: string
  hint?: string
  values: Record<string, CompareValue>
}

export const COMPARE_COLUMNS: CompareColumn[] = [
  { id: "nuxus", name: "Nuxus", note: "MIT", ours: true },
  { id: "kits", name: "Component kits", note: "Typical" },
  { id: "build", name: "Building it yourself", note: "In-house" },
]

export const COMPARE_ROWS: CompareRow[] = [
  { feature: "Live preview before you copy", values: { nuxus: true, kits: "partial", build: false } },
  { feature: "Source you own outright", hint: "No runtime dependency on us", values: { nuxus: true, kits: "partial", build: true } },
  { feature: "Agent-ready prompt per component", values: { nuxus: true, kits: false, build: false } },
  { feature: "Themeable from your own tokens", values: { nuxus: true, kits: "partial", build: true } },
  { feature: "Keyboard and screen-reader paths", values: { nuxus: true, kits: "partial", build: "partial" } },
  { feature: "Ships TypeScript types", values: { nuxus: true, kits: true, build: true } },
  { feature: "Hosted and run for you", values: { nuxus: false, kits: false, build: false } },
  { feature: "Time to first screen", values: { nuxus: "Minutes", kits: "Hours", build: "Weeks" } },
  { feature: "Ongoing licence cost", values: { nuxus: "None", kits: "Per seat", build: "Salaries" } },
]

/** Two rows are the same only if every column agrees. */
function isUniform(row: CompareRow, columns: CompareColumn[]) {
  const [first, ...rest] = columns.map((c) => row.values[c.id])
  return rest.every((value) => value === first)
}

/**
 * A feature comparison table, with the row noise filtered out on request.
 *
 * Rows where every column agrees are the ones nobody reads — they're there for
 * completeness, and they bury the handful of rows the decision actually turns
 * on. The toggle hides them, and says how many it hid rather than silently
 * shrinking the table.
 *
 * It stays a real `<table>`: a grid of divs loses the row and column
 * association that lets a screen reader say which feature and which product a
 * cell belongs to, which is the entire content here.
 */
export function CompareTable({
  columns = COMPARE_COLUMNS,
  rows = COMPARE_ROWS,
  title = "How it compares",
  blurb = "The same questions we asked before building this.",
  className,
}: {
  columns?: CompareColumn[]
  rows?: CompareRow[]
  title?: string
  blurb?: string
  className?: string
}) {
  const [onlyDiffs, setOnlyDiffs] = React.useState(false)

  const shared = React.useMemo(
    () => rows.filter((row) => isUniform(row, columns)).length,
    [columns, rows],
  )
  const shown = onlyDiffs ? rows.filter((row) => !isUniform(row, columns)) : rows

  return (
    <section className={cn("w-full bg-background px-4 py-16 text-foreground md:px-6", className)}>
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
            {blurb ? <p className="mt-2 text-sm text-muted-foreground">{blurb}</p> : null}
          </div>

          {shared > 0 ? (
            <button
              type="button"
              role="switch"
              aria-checked={onlyDiffs}
              onClick={() => setOnlyDiffs((prev) => !prev)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[0.72rem] font-medium",
                "transition-colors hover:border-foreground/25",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              )}
            >
              <span
                aria-hidden
                className={cn("relative h-3.5 w-6 rounded-full transition-colors", onlyDiffs ? "bg-primary" : "bg-border")}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-2.5 rounded-full bg-background transition-[left] duration-200",
                    onlyDiffs ? "left-3" : "left-0.5",
                  )}
                />
              </span>
              Only differences
            </button>
          ) : null}
        </header>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">
              {title}. {shown.length} of {rows.length} rows shown.
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 bg-card px-4 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground"
                >
                  Feature
                </th>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className={cn(
                      "px-4 py-3.5 text-center align-bottom",
                      column.ours ? "bg-primary/[0.07]" : "bg-card",
                    )}
                  >
                    <span
                      className={cn(
                        "block text-[0.82rem] font-semibold",
                        column.ours ? "text-primary" : "text-foreground",
                      )}
                    >
                      {column.name}
                    </span>
                    {column.note ? (
                      <span className="mt-0.5 block text-[0.62rem] uppercase tracking-[0.1em] text-muted-foreground">
                        {column.note}
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {shown.map((row) => (
                <tr key={row.feature} className="border-t border-border">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-background px-4 py-3.5 text-[0.82rem] font-normal"
                  >
                    {row.feature}
                    {row.hint ? (
                      <span className="mt-0.5 block text-[0.68rem] text-muted-foreground">{row.hint}</span>
                    ) : null}
                  </th>
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn("px-4 py-3.5 text-center", column.ours && "bg-primary/[0.05]")}
                    >
                      <Value value={row.values[column.id]} ours={column.ours} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p aria-live="polite" className="mt-3 text-[0.72rem] text-muted-foreground">
          {onlyDiffs
            ? `Hiding ${shared} row${shared === 1 ? "" : "s"} where every option is the same.`
            : `${rows.length} rows · ${shared} identical across all options.`}
        </p>
      </div>
    </section>
  )
}

function Value({ value, ours }: { value: CompareValue | undefined; ours?: boolean }) {
  if (value === true) {
    return (
      <>
        <Check
          aria-hidden
          className={cn("mx-auto size-4", ours ? "text-primary" : "text-foreground/70")}
          strokeWidth={2.5}
        />
        <span className="sr-only">Yes</span>
      </>
    )
  }

  if (value === false || value === undefined) {
    return (
      <>
        <X aria-hidden className="mx-auto size-4 text-muted-foreground/40" strokeWidth={2.5} />
        <span className="sr-only">No</span>
      </>
    )
  }

  if (value === "partial") {
    return (
      <>
        <Minus aria-hidden className="mx-auto size-4 text-muted-foreground/70" strokeWidth={2.5} />
        <span className="sr-only">Partial</span>
      </>
    )
  }

  return (
    <span className={cn("text-[0.8rem]", ours ? "font-medium text-primary" : "text-muted-foreground")}>
      {value}
    </span>
  )
}
