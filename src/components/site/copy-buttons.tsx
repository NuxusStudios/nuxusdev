"use client"

import * as React from "react"
import { Check, Copy, Loader2, Lock, Sparkles, Terminal } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useCopyGate } from "@/components/site/copy-gate"
import { cn } from "@/lib/utils"
import type { CopyKind } from "@/server/actions/source"

/** The primary action on a component page: one prompt, works in any tool. */
export function CopyPromptButton({
  componentId,
  name,
  canCopy,
  className,
}: {
  componentId: string
  name: string
  canCopy: boolean
  className?: string
}) {
  const { copy, pending } = useCopyGate()
  const [done, setDone] = React.useState(false)
  const busy = pending === `${componentId}:prompt`

  return (
    <Button
      size="sm"
      className={cn("gap-1.5", className)}
      disabled={busy}
      onClick={async () => {
        const ok = await copy(componentId, "prompt", { label: name })
        if (ok) {
          setDone(true)
          setTimeout(() => setDone(false), 2000)
        }
      }}
    >
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : done ? (
        <Check className="size-3.5" />
      ) : canCopy ? (
        <Sparkles className="size-3.5" />
      ) : (
        <Lock className="size-3.5" />
      )}
      {done ? "Copied" : "Copy prompt"}
    </Button>
  )
}

/** Small copy control used inside the code panel header. */
export function CopyTextButton({
  componentId,
  kind,
  label = "Copy",
  className,
}: {
  componentId: string
  kind: CopyKind
  label?: string
  className?: string
}) {
  const { copy, pending } = useCopyGate()
  const [done, setDone] = React.useState(false)
  const busy = pending === `${componentId}:${kind}`

  return (
    <button
      onClick={async () => {
        const ok = await copy(componentId, kind)
        if (ok) {
          setDone(true)
          setTimeout(() => setDone(false), 1800)
        }
      }}
      disabled={busy}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60",
        className
      )}
    >
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : done ? (
        <Check className="size-3.5 text-emerald-400" />
      ) : (
        <Copy className="size-3.5" />
      )}
      {done ? "Copied" : label}
    </button>
  )
}

const MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const

export function CliDialog({
  componentId,
  fileName,
  dependencies,
  canCopy,
}: {
  componentId: string
  fileName: string
  dependencies: string[]
  canCopy: boolean
}) {
  const [manager, setManager] = React.useState<(typeof MANAGERS)[number]>("npm")
  const { copy, pending } = useCopyGate()
  const busy = pending === `${componentId}:cli`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Terminal className="size-3.5" />
          CLI
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Install with the CLI</DialogTitle>
          <DialogDescription>
            Adds {fileName} and its demo to your project through the shadcn registry.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex gap-1">
          {MANAGERS.map((m) => (
            <button
              key={m}
              onClick={() => setManager(m)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[13px] transition-colors",
                manager === m
                  ? "border-border-strong bg-secondary text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-[#0b0b0e] p-3">
          <code
            className={cn(
              "flex-1 overflow-x-auto whitespace-nowrap font-mono text-[12.5px]",
              canCopy ? "text-foreground/80" : "select-none text-foreground/25 blur-[3px]"
            )}
            aria-hidden={!canCopy}
          >
            npx shadcn@latest add &quot;…&quot;
          </code>
          <Button
            size="xs"
            variant="secondary"
            disabled={busy}
            onClick={() => copy(componentId, "cli", { manager })}
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : canCopy ? (
              <Copy className="size-3.5" />
            ) : (
              <Lock className="size-3.5" />
            )}
            Copy
          </Button>
        </div>

        {dependencies.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Also installs: {dependencies.join(", ")}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
