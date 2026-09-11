"use client"

import * as React from "react"
import { ChevronRight, File, Folder } from "lucide-react"
import { cn } from "@/lib/utils"

export type TreeNode =
  | { type: "file"; name: string }
  | { type: "folder"; name: string; children: TreeNode[]; defaultOpen?: boolean }

export function FileTree({ nodes, className }: { nodes: TreeNode[]; className?: string }) {
  return (
    <div className={cn("w-full max-w-xs select-none rounded-xl border border-white/10 bg-white/[0.02] p-2 text-sm", className)}>
      {nodes.map((n, i) => (
        <TreeItem key={i} node={n} depth={0} />
      ))}
    </div>
  )
}

function TreeItem({ node, depth }: { node: TreeNode; depth: number }) {
  const [open, setOpen] = React.useState(node.type === "folder" ? node.defaultOpen ?? false : false)

  if (node.type === "file") {
    return (
      <div
        className="flex cursor-default items-center gap-2 rounded-md px-2 py-1 text-white/60 transition hover:bg-white/5 hover:text-white"
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <File className="size-3.5 shrink-0 text-white/30" />
        <span className="truncate">{node.name}</span>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-white/75 transition hover:bg-white/5"
        style={{ paddingLeft: 8 + depth * 14 }}
      >
        <ChevronRight className={cn("size-3.5 shrink-0 text-white/35 transition-transform", open && "rotate-90")} />
        <Folder className="size-3.5 shrink-0 text-sky-400/70" />
        <span className="truncate">{node.name}</span>
      </button>
      {open && node.children.map((c, i) => <TreeItem key={i} node={c} depth={depth + 1} />)}
    </div>
  )
}
