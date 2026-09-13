"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TrendSeries {
  label: string
  /** One value per label. Must be the same length as `labels`. */
  points: number[]
  /** Any CSS colour. Defaults walk down from the primary token. */
  color?: string
}

export const TREND_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]

export const TREND_SERIES: TrendSeries[] = [
  { label: "Requests", points: [18, 22, 19, 28, 26, 34, 31, 40, 44, 41, 52, 58] },
  { label: "Cached", points: [11, 14, 13, 18, 19, 22, 24, 27, 31, 30, 38, 44] },
]

const PAD = { top: 16, right: 16, bottom: 26, left: 34 }
const ROWS = 4

const shade = (i: number) =>
  i === 0
    ? "var(--color-primary)"
    : `color-mix(in oklch, var(--color-primary) ${Math.max(18, 70 - i * 26)}%, var(--color-background))`

/**
 * A line chart with a crosshair that reads the nearest sample.
 *
 * Laid out in real pixels from a measured box rather than in a normalised
 * viewBox. A viewBox with `preserveAspectRatio="none"` is the usual shortcut
 * for making an SVG chart responsive, and it stretches the geometry — strokes
 * go lopsided and every dot turns into an ellipse. Measuring costs one
 * ResizeObserver and keeps circles round.
 *
 * The crosshair is driven by pointer *and* keyboard from the same index, and
 * the numbers are also emitted as an off-screen table, because a chart that
 * only exists as a path is unreadable to anything that isn't a pair of eyes.
 */
export function TrendChart({
  series = TREND_SERIES,
  labels = TREND_LABELS,
  title = "Edge traffic",
  unit = "M",
  className,
}: {
  series?: TrendSeries[]
  labels?: string[]
  title?: string
  unit?: string
  className?: string
}) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState({ w: 0, h: 260 })
  const [cursor, setCursor] = React.useState<number | null>(null)

  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const read = () =>
      setBox((prev) => {
        const w = host.clientWidth
        const h = host.clientHeight
        return prev.w === w && prev.h === h ? prev : { w, h }
      })
    read()
    const observer = new ResizeObserver(read)
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  const count = labels.length
  const top = Math.max(1, Math.max(...series.flatMap((s) => s.points)))
  const plotW = Math.max(1, box.w - PAD.left - PAD.right)
  const plotH = Math.max(1, box.h - PAD.top - PAD.bottom)
  const stride = count > 1 ? plotW / (count - 1) : 0

  const xAt = (i: number) => PAD.left + i * stride
  const yAt = (v: number) => PAD.top + plotH - (v / top) * plotH

  const pick = (clientX: number) => {
    const host = hostRef.current
    if (!host || stride === 0) return
    const rect = host.getBoundingClientRect()
    const i = Math.round((clientX - rect.left - PAD.left) / stride)
    setCursor(Math.min(count - 1, Math.max(0, i)))
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      setCursor(event.key === "Home" ? 0 : count - 1)
      return
    }
    const delta = steps[event.key]
    if (delta === undefined) return
    event.preventDefault()
    setCursor((prev) => Math.min(count - 1, Math.max(0, (prev ?? 0) + delta)))
  }

  const active = cursor ?? null
  // Flip the readout to the other side before it runs off the right edge.
  const flip = active !== null && xAt(active) > PAD.left + plotW * 0.66

  return (
    <div className={cn("w-full bg-background p-6 text-foreground", className)}>
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card p-5">
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <ul className="flex items-center gap-4">
            {series.map((s, i) => (
              <li key={s.label} className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                <span className="size-2 rounded-full" style={{ backgroundColor: s.color ?? shade(i) }} />
                {s.label}
              </li>
            ))}
          </ul>
        </header>

        <div
          ref={hostRef}
          tabIndex={0}
          role="img"
          aria-label={`${title}. Use the arrow keys to read each point.`}
          onKeyDown={onKeyDown}
          onPointerMove={(event) => pick(event.clientX)}
          onPointerLeave={() => setCursor(null)}
          onBlur={() => setCursor(null)}
          className="relative h-[260px] w-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <svg width={box.w} height={box.h} className="block overflow-visible">
            {Array.from({ length: ROWS + 1 }, (_, r) => {
              const value = (top / ROWS) * (ROWS - r)
              const y = yAt(value)
              return (
                <g key={r}>
                  <line x1={PAD.left} x2={box.w - PAD.right} y1={y} y2={y} stroke="var(--color-border)" strokeWidth={1} />
                  <text x={PAD.left - 8} y={y + 3} textAnchor="end" fontSize={9} fill="currentColor" opacity={0.45}>
                    {Math.round(value)}
                  </text>
                </g>
              )
            })}

            {series.map((s, i) => {
              const tone = s.color ?? shade(i)
              const line = s.points.map((v, j) => `${j === 0 ? "M" : "L"}${xAt(j)},${yAt(v)}`).join(" ")
              return (
                <g key={s.label}>
                  {i === 0 ? (
                    <path
                      d={`${line} L${xAt(count - 1)},${PAD.top + plotH} L${PAD.left},${PAD.top + plotH} Z`}
                      fill={tone}
                      opacity={0.1}
                    />
                  ) : null}
                  <path
                    d={line}
                    fill="none"
                    stroke={tone}
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={1}
                    strokeDasharray="1 1"
                    className="[animation:trend-draw_900ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:[animation:none]"
                    style={{ animationDelay: `${i * 140}ms` }}
                  />
                </g>
              )
            })}

            {labels.map((label, i) =>
              // Thin the axis out rather than letting the months collide.
              i % Math.ceil(count / 6) === 0 ? (
                <text
                  key={label}
                  x={xAt(i)}
                  y={box.h - 8}
                  textAnchor="middle"
                  fontSize={9}
                  fill="currentColor"
                  opacity={0.45}
                >
                  {label}
                </text>
              ) : null,
            )}

            {active !== null ? (
              <g>
                <line
                  x1={xAt(active)}
                  x2={xAt(active)}
                  y1={PAD.top}
                  y2={PAD.top + plotH}
                  stroke="var(--color-primary)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  opacity={0.6}
                />
                {series.map((s, i) => (
                  <circle
                    key={s.label}
                    cx={xAt(active)}
                    cy={yAt(s.points[active] ?? 0)}
                    r={3.5}
                    fill="var(--color-card)"
                    stroke={s.color ?? shade(i)}
                    strokeWidth={2}
                  />
                ))}
              </g>
            ) : null}
          </svg>

          {active !== null ? (
            <div
              className="pointer-events-none absolute top-3 min-w-[8rem] rounded-lg border border-border bg-card/95 p-2.5 backdrop-blur-sm"
              style={flip ? { right: box.w - xAt(active) + 12 } : { left: xAt(active) + 12 }}
            >
              <p className="text-[0.65rem] uppercase tracking-[0.1em] text-muted-foreground">{labels[active]}</p>
              {series.map((s, i) => (
                <p key={s.label} className="mt-1 flex items-center justify-between gap-4 text-[0.75rem]">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-1.5 rounded-full" style={{ backgroundColor: s.color ?? shade(i) }} />
                    {s.label}
                  </span>
                  <span className="tabular-nums">
                    {s.points[active]}
                    {unit}
                  </span>
                </p>
              ))}
            </div>
          ) : null}
        </div>

        {/* The same numbers, for anything that cannot read a path. */}
        <table className="sr-only">
          <caption>{title}</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              {series.map((s) => (
                <th key={s.label} scope="col">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {labels.map((label, i) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {series.map((s) => (
                  <td key={s.label}>
                    {s.points[i]}
                    {unit}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes trend-draw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
      `}</style>
    </div>
  )
}
