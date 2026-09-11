"use client"

import * as React from "react"
import { ScrollProgress, ScrollProgressRing } from "@/registry/components/reading-progress"

export default function DemoScrollProgress() {
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="relative h-[420px] overflow-y-auto bg-zinc-950">
      <ScrollProgress target={ref} />
      <div className="sticky top-3 z-40 flex justify-end px-5 text-sky-400">
        <ScrollProgressRing target={ref} />
      </div>
      <div className="mx-auto max-w-lg px-6 pb-16">
        <h2 className="text-2xl font-semibold tracking-tight text-white">Scroll to fill</h2>
        <div className="mt-6 space-y-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <p key={i} className="text-sm leading-relaxed text-white/45">
              The bar at the top and the ring on the right both track this container&apos;s scroll
              position, smoothed with a spring so they never feel jumpy.
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
