"use client"

import * as React from "react"
import { Command, Search } from "lucide-react"
import { KeycapButton } from "@/registry/components/keycap-button"

export default function DemoKeycapButton() {
  const [hits, setHits] = React.useState(0)

  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center gap-6 bg-background p-8">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <KeycapButton shortcut="k" meta onTrigger={() => setHits((n) => n + 1)}>
          <Search className="size-4" />
          Search
        </KeycapButton>

        <KeycapButton shortcut="n" onTrigger={() => setHits((n) => n + 1)}>
          <Command className="size-4" />
          New file
        </KeycapButton>

        <KeycapButton disabled>Archived</KeycapButton>
      </div>

      <p className="text-center text-[0.75rem] text-muted-foreground">
        Press <kbd className="font-mono">⌘K</kbd> or <kbd className="font-mono">N</kbd> on your
        keyboard — the cap goes down too.
        <span className="mt-1 block tabular-nums text-foreground/70">triggered {hits}×</span>
      </p>
    </div>
  )
}
