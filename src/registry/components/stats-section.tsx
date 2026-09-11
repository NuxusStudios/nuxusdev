"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface Stat {
  value: number
  suffix?: string
  prefix?: string
  label: string
  decimals?: number
}

export function StatsSection({
  stats,
  title,
  className,
}: {
  stats: Stat[]
  title?: string
  className?: string
}) {
  return (
    <section className={cn("w-full px-6 py-16", className)}>
      <div className="mx-auto max-w-5xl">
        {title && (
          <h2 className="mb-10 max-w-lg text-3xl font-semibold tracking-tight text-white">{title}</h2>
        )}
        <dl className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1 bg-zinc-950 p-6">
              <dt className="text-sm text-white/40">{s.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight text-white tabular-nums">
                {s.prefix}
                <Counter value={s.value} decimals={s.decimals} />
                {s.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Counter({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const duration = 1400
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - p, 3)
          setDisplay(value * eased)
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.3 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {display.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  )
}
