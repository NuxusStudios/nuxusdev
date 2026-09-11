"use client"

import * as React from "react"
import { Check, Loader2, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { ComponentGrid } from "@/components/site/component-grid"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createCollection, deleteCollection } from "@/server/actions/collections"
import { cn } from "@/lib/utils"
import type { ComponentRecord } from "@/lib/types"

export interface BookmarkList {
  id: string
  name: string
  slug: string
  isDefault: boolean
  components: ComponentRecord[]
}

export function BookmarkLists({ lists }: { lists: BookmarkList[] }) {
  const [active, setActive] = React.useState(lists[0]?.id ?? "")
  const [creating, setCreating] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [pending, setPending] = React.useState(false)

  const current = lists.find((list) => list.id === active) ?? lists[0]

  async function submitNew(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    const result = await createCollection(newName)
    setPending(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(`Created “${result.data.name}”`)
    setNewName("")
    setCreating(false)
  }

  async function remove(id: string, name: string) {
    setPending(true)
    const result = await deleteCollection(id)
    setPending(false)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast(`Deleted “${name}”`)
    if (active === id) setActive(lists[0]?.id ?? "")
  }

  if (!current) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-border px-8 py-20 text-center">
        <p className="text-sm font-medium">No lists yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Bookmark a component and it lands in your Saved list.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <ul className="flex flex-wrap gap-1 lg:flex-col">
          {lists.map((list) => (
            <li key={list.id} className="group/item flex items-center gap-1 lg:w-full">
              <button
                onClick={() => setActive(list.id)}
                className={cn(
                  "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors",
                  list.id === current.id
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <span className="truncate">{list.name}</span>
                <span className="tabular-nums text-muted-foreground/60">
                  {list.components.length}
                </span>
              </button>
              {!list.isDefault && (
                <button
                  onClick={() => remove(list.id, list.name)}
                  disabled={pending}
                  aria-label={`Delete ${list.name}`}
                  className="rounded-md p-1.5 text-muted-foreground/50 opacity-0 transition hover:bg-accent hover:text-destructive group-hover/item:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </li>
          ))}

          <li className="lg:w-full">
            {creating ? (
              <form onSubmit={submitNew} className="flex items-center gap-1">
                <Input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="List name"
                  maxLength={60}
                  className="h-8 text-[13px]"
                />
                <Button type="submit" size="icon-sm" disabled={pending || !newName.trim()}>
                  {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setCreating(false)}
                >
                  <X className="size-3.5" />
                </Button>
              </form>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                <Plus className="size-3.5" /> Create list
              </button>
            )}
          </li>
        </ul>
      </aside>

      <div>
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-[15px] font-semibold">{current.name}</h2>
          <span className="text-[13px] text-muted-foreground">
            {current.components.length} component{current.components.length === 1 ? "" : "s"}
          </span>
        </div>

        {current.components.length > 0 ? (
          <ComponentGrid components={current.components} columns="three" />
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-8 py-16 text-center">
            <p className="text-sm font-medium">Nothing here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hit the bookmark icon on any component to add it.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
