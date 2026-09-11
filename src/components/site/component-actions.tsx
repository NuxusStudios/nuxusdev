"use client"

import * as React from "react"
import { Bookmark, Flag, GitFork } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useBookmarks } from "@/components/site/bookmark-store"
import { cn } from "@/lib/utils"

export function SaveButton({ componentId, name }: { componentId: string; name: string }) {
  const bookmarks = useBookmarks()
  const saved = bookmarks.has(componentId)

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() => void bookmarks.toggle(componentId, name)}
    >
      <Bookmark className={cn("size-3.5", saved && "fill-foreground")} />
      {saved ? "Saved" : "Save"}
    </Button>
  )
}

export function RemixButton({ name }: { name: string }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      onClick={() =>
        toast("Opening in the editor", {
          description: `Forking ${name} into a new draft — sign in to keep it.`,
        })
      }
    >
      <GitFork className="size-3.5" />
      Remix
    </Button>
  )
}

export function ReportButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5 text-muted-foreground"
      onClick={() => toast("Report submitted", { description: "Thanks — we'll take a look." })}
    >
      <Flag className="size-3.5" />
      Report
    </Button>
  )
}
