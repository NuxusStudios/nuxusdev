"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface Step {
  title: string
  description: string
  content?: React.ReactNode
}

export function FeatureSteps({
  steps,
  autoplay = true,
  interval = 4000,
  className,
}: {
  steps: Step[]
  autoplay?: boolean
  interval?: number
  className?: string
}) {
  const [active, setActive] = React.useState(0)
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    if (!autoplay) return
    const started = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min((now - started) / interval, 1)
      setProgress(p)
      if (p < 1) raf = requestAnimationFrame(tick)
      else setActive((a) => (a + 1) % steps.length)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, autoplay, interval, steps.length])

  return (
    <div className={cn("grid gap-10 lg:grid-cols-2 lg:items-center", className)}>
      <ol className="flex flex-col gap-1">
        {steps.map((step, i) => {
          const isActive = i === active
          return (
            <li key={step.title}>
              <button
                onClick={() => setActive(i)}
                className={cn(
                  "flex w-full gap-4 rounded-xl px-4 py-4 text-left transition-colors",
                  isActive ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-medium transition-colors",
                    isActive
                      ? "border-white bg-white text-black"
                      : "border-white/20 text-white/40"
                  )}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-[15px] font-medium transition-colors",
                      isActive ? "text-white" : "text-white/50"
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-white/40">
                    {step.description}
                  </span>
                  {isActive && autoplay && (
                    <span className="mt-3 block h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full bg-white/70"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-500",
              i === active ? "opacity-100 blur-0" : "pointer-events-none opacity-0 blur-sm"
            )}
          >
            {step.content ?? (
              <span className="text-6xl font-semibold tracking-tighter text-white/10">
                {String(i + 1).padStart(2, "0")}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
