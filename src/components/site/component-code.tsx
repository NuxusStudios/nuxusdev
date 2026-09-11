"use client"

import * as React from "react"
import Link from "next/link"
import { Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopyTextButton } from "@/components/site/copy-buttons"
import { cn } from "@/lib/utils"
import type { CopyKind } from "@/server/actions/source"

export interface CodeFile {
  name: string
  /** pre-highlighted HTML. When locked this is only the teaser lines. */
  html: string
  kind: CopyKind
  totalLines: number
  /** how many lines the teaser actually contains */
  shownLines: number
}

/**
 * The code panel.
 *
 * When the viewer has no plan the server sends only the opening lines, so the
 * rest of the source is not in the page at all — the fade is a visual cue, not
 * the protection.
 */
export function ComponentCode({
  componentId,
  files,
  canCopy,
  maxHeight = 430,
}: {
  componentId: string
  files: CodeFile[]
  canCopy: boolean
  maxHeight?: number
}) {
  const [active, setActive] = React.useState(0)
  const file = files[active]

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-[#0b0b0e]">
      <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
        {files.map((f, i) => (
          <button
            key={f.name}
            onClick={() => setActive(i)}
            className={cn(
              "rounded-md px-2.5 py-1 font-mono text-[12px] transition-colors",
              i === active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.name}
          </button>
        ))}
        <div className="ml-auto pr-1">
          {canCopy ? (
            <CopyTextButton componentId={componentId} kind={file.kind} />
          ) : (
            <span className="inline-flex h-7 items-center gap-1.5 px-2 text-[12px] text-muted-foreground/70">
              <Lock className="size-3.5" />
              {file.totalLines} lines
            </span>
          )}
        </div>
      </div>

      <div>
        <div className="relative">
          <div
            className={cn("overflow-auto", !canCopy && "select-none")}
            style={canCopy ? { maxHeight } : undefined}
            dangerouslySetInnerHTML={{
              __html: file.html.replace('class="shiki-pre"', 'class="shiki-pre with-line-numbers"'),
            }}
          />
          {!canCopy && (
            /* the last teaser line fades, so the cut reads as intentional */
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-[#0b0b0e] to-transparent"
            />
          )}
        </div>

        {!canCopy && (
          <>
            <div className="flex flex-col items-center gap-2.5 border-t border-border px-6 py-6 text-center">
              <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground">
                <Lock className="size-4" />
              </span>
              <p className="text-[13px] font-medium">
                {Math.max(file.totalLines - file.shownLines, 0)} more lines behind a plan
              </p>
              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                Previews are free to watch. Reading and copying the full source needs a plan.
              </p>
              <Button size="sm" asChild className="mt-1.5 gap-1.5">
                <Link href="/pricing">
                  <Sparkles className="size-3.5" />
                  See plans
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
