"use client"

import * as React from "react"
import { SplitFlap } from "@/registry/components/split-flap"

const BOARD = [
  { time: "09:40", to: "AMSTERDAM", gate: "B12" },
  { time: "10:15", to: "LISBON", gate: "A04" },
  { time: "11:02", to: "REYKJAVIK", gate: "C21" },
  { time: "12:30", to: "SINGAPORE", gate: "D07" },
]

export default function DemoSplitFlap() {
  const [at, setAt] = React.useState(0)

  React.useEffect(() => {
    const id = window.setInterval(() => setAt((prev) => (prev + 1) % BOARD.length), 4200)
    return () => window.clearInterval(id)
  }, [])

  const row = BOARD[at]!

  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center gap-6 bg-background p-8">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">Departures</p>
      <SplitFlap value={row.to} length={10} />
      <div className="flex items-center gap-8">
        <SplitFlap value={row.time} length={5} cellClassName="h-10 w-7 text-xl" />
        <SplitFlap value={row.gate} length={3} cellClassName="h-10 w-7 text-xl" />
      </div>
    </div>
  )
}
