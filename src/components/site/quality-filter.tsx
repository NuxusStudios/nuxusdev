"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import { CHECKS, type CheckId } from "@/lib/quality"
import { cn } from "@/lib/utils"

/**
 * Narrows the grid to components that pass the selected checks.
 *
 * The state lives in the URL so a filtered view can be linked and shared, and
 * so the server does the filtering rather than shipping the whole catalogue.
 */
export function QualityFilter({ active }: { active: CheckId[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function toggle(id: CheckId) {
    const next = active.includes(id) ? active.filter((c) => c !== id) : [...active, id]
    const query = new URLSearchParams(params.toString())

    if (next.length) query.set("checks", next.join(","))
    else query.delete("checks")

    router.push(`${pathname}${query.size ? `?${query}` : ""}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-[13px] text-muted-foreground">Only show</span>
      {CHECKS.map((check) => {
        const on = active.includes(check.id)
        return (
          <button
            key={check.id}
            type="button"
            onClick={() => toggle(check.id)}
            aria-pressed={on}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[12px] font-medium transition-colors",
              on
                ? "border-foreground/30 bg-foreground/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {on && <Check className="size-3" />}
            {check.label}
          </button>
        )
      })}
    </div>
  )
}
