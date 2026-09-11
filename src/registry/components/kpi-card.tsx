"use client"

import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface KpiCardProps {
  label: string
  value: string
  change: number
  hint?: string
  series?: number[]
  className?: string
}

export function KpiCard({ label, value, change, hint, series = [], className }: KpiCardProps) {
  const up = change >= 0
  const points = sparkline(series, 120, 34)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-foreground/10 bg-foreground/[0.03] p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-[13px] font-medium text-foreground/45">{label}</span>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium",
            up ? "bg-emerald-500/12 text-emerald-400" : "bg-rose-500/12 text-rose-400"
          )}
        >
          {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
          {Math.abs(change).toFixed(1)}%
        </span>
      </div>

      <div className="flex items-end justify-between gap-4">
        <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">{value}</span>
        {points && (
          <svg width={120} height={34} className="overflow-visible">
            <polyline
              points={points}
              fill="none"
              stroke={up ? "#34d399" : "#fb7185"}
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {hint && <span className="text-xs text-foreground/30">{hint}</span>}
    </div>
  )
}

function sparkline(values: number[], w: number, h: number) {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")
}
