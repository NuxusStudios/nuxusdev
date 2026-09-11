"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { ComponentGrid } from "@/components/site/component-grid"
import type { ComponentRecord } from "@/lib/types"

/**
 * Reveals the catalogue a page at a time — components mount their own iframe
 * previews, so rendering the whole list up front would be wasteful.
 */
export function LoadMoreGrid({
  components,
  pageSize = 12,
}: {
  components: ComponentRecord[]
  pageSize?: number
}) {
  const [shown, setShown] = React.useState(pageSize)
  const sentinel = React.useRef<HTMLDivElement>(null)
  const hasMore = shown < components.length

  React.useEffect(() => {
    const el = sentinel.current
    if (!el || !hasMore) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown((s) => Math.min(s + pageSize, components.length))
        }
      },
      { rootMargin: "600px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, pageSize, components.length])

  return (
    <>
      <ComponentGrid components={components.slice(0, shown)} />

      {hasMore ? (
        <div ref={sentinel} className="flex justify-center py-10">
          <button
            onClick={() => setShown((s) => Math.min(s + pageSize, components.length))}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:bg-accent hover:text-foreground"
          >
            <Loader2 className="size-3.5 animate-spin" />
            Loading more — {components.length - shown} left
          </button>
        </div>
      ) : (
        components.length > pageSize && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            That&apos;s all {components.length} components
          </p>
        )
      )}
    </>
  )
}
