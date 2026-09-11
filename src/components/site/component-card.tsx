"use client"

import Link from "next/link"
import * as React from "react"
import { Bookmark } from "lucide-react"
import { ComponentPreview } from "@/components/site/component-preview"
import { useBookmarks } from "@/components/site/bookmark-store"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAuthor } from "@/lib/data/authors"
import { componentHref } from "@/lib/queries"
import { cn, formatCount, initials } from "@/lib/utils"
import type { ComponentRecord } from "@/lib/types"

export function ComponentCard({
  component,
  aspect = 4 / 3,
  className,
  showAuthor = true,
}: {
  component: ComponentRecord
  aspect?: number
  className?: string
  showAuthor?: boolean
}) {
  const author = getAuthor(component.authorHandle)
  const bookmarks = useBookmarks()
  const saved = bookmarks.has(component.id)

  return (
    <div className={cn("group flex flex-col gap-2.5", className)}>
      <Link
        href={componentHref(component)}
        className="relative block overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ComponentPreview
          previewKey={component.previewKey}
          frameWidth={component.previewWidth ?? 1200}
          aspect={aspect}
          className="transition-all duration-300 group-hover:border-border-strong"
        />
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-foreground/0 transition-colors duration-300 group-hover:bg-foreground/[0.03]" />

        <button
          onClick={(e) => {
            e.preventDefault()
            void bookmarks.toggle(component.id, component.name)
          }}
          aria-label={saved ? "Remove bookmark" : "Save component"}
          className={cn(
            "absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background/70 backdrop-blur transition-all",
            "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:border-border-strong",
            saved && "opacity-100"
          )}
        >
          <Bookmark className={cn("size-3.5", saved ? "fill-foreground text-foreground" : "text-muted-foreground")} />
        </button>
      </Link>

      <div className="flex items-center justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-center gap-2">
          {showAuthor && (
            <Link href={`/@${author.handle}`} className="shrink-0">
              <Avatar className="size-5">
                {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
                <AvatarFallback>{initials(author.name)}</AvatarFallback>
              </Avatar>
            </Link>
          )}
          <Link
            href={componentHref(component)}
            className="truncate text-[13px] font-medium text-foreground/90 transition-colors hover:text-foreground"
          >
            {component.name}
          </Link>
        </div>
        <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
          {formatCount(component.bookmarks)}
        </span>
      </div>
    </div>
  )
}
