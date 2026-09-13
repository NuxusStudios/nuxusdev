"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface Meter {
  id: string
  label: string
  /** Units included before this meter starts charging. */
  free: number
  /** Price per unit past the included allowance, in whole currency. */
  rate: number
  min: number
  max: number
  step: number
  start: number
  unit: string
}

export const METERS: Meter[] = [
  { id: "seats", label: "Seats", free: 3, rate: 12, min: 1, max: 120, step: 1, start: 12, unit: "" },
  { id: "calls", label: "API calls", free: 1, rate: 0.4, min: 0, max: 250, step: 1, start: 24, unit: "M / mo" },
  { id: "store", label: "Object storage", free: 25, rate: 0.08, min: 0, max: 2000, step: 25, start: 250, unit: "GB" },
]

const TIERS = [
  { name: "Starter", upTo: 60, blurb: "One team, one region" },
  { name: "Team", upTo: 400, blurb: "Shared workspaces and SSO" },
  { name: "Scale", upTo: Infinity, blurb: "Dedicated capacity and support" },
]

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })

/** Unit rates are cents-scale, so they need the decimals the totals don't. */
const rate = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })

/**
 * A usage estimator: move the meters, watch the bill.
 *
 * Every meter is billed on the overage only, so the first units of each are
 * free and the total stays at zero until real usage starts — which is what the
 * pricing page it sits on is actually claiming, and worth showing rather than
 * asserting.
 *
 * The headline figure is tweened through a ref. Routing it through state would
 * re-render three sliders and the whole breakdown on every animation frame, and
 * dragging a slider already re-renders them once per input event as it is.
 */
export function UsageCalculator({
  meters = METERS,
  /** Months charged on the annual plan. Twelve means no discount. */
  annualMonths = 10,
  className,
}: {
  meters?: Meter[]
  annualMonths?: number
  className?: string
}) {
  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(meters.map((m) => [m.id, m.start])),
  )
  const [annual, setAnnual] = React.useState(false)
  const totalRef = React.useRef<HTMLSpanElement>(null)

  const lines = meters.map((meter) => {
    const used = values[meter.id] ?? meter.start
    const billable = Math.max(0, used - meter.free)
    return { meter, used, billable, cost: billable * meter.rate }
  })

  const monthly = lines.reduce((sum, line) => sum + line.cost, 0)
  const charged = annual ? (monthly * annualMonths) / 12 : monthly
  const tier = TIERS.find((t) => monthly <= t.upTo) ?? TIERS[TIERS.length - 1]!

  // Tween the headline toward whatever the sliders now say.
  React.useEffect(() => {
    const node = totalRef.current
    if (!node) return

    const from = Number(node.dataset.value ?? "0")
    const to = charged
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || from === to) {
      node.dataset.value = String(to)
      node.textContent = money(to)
      return
    }

    let raf = 0
    // Start from the first frame's own timestamp rather than reading the clock
    // in the effect body, which is a side effect the compiler rightly rejects.
    let started = 0
    const run = (now: number) => {
      if (!started) started = now
      const t = Math.min(1, (now - started) / 380)
      const eased = 1 - (1 - t) ** 3
      const at = from + (to - from) * eased
      node.dataset.value = String(at)
      node.textContent = money(at)
      if (t < 1) raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [charged])

  return (
    <section className={cn("w-full bg-background p-6 text-foreground", className)}>
      <div className="mx-auto grid max-w-4xl gap-4 rounded-2xl border border-border bg-card p-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <header className="flex items-center justify-between gap-4 pb-5">
            <div>
              <h3 className="text-base font-semibold tracking-tight">Estimate your bill</h3>
              <p className="mt-1 text-[0.78rem] text-muted-foreground">
                Only usage past the included allowance is charged.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual((prev) => !prev)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border border-border px-2.5 py-1.5",
                "text-[0.7rem] font-medium transition-colors hover:border-foreground/25",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "relative h-3.5 w-6 rounded-full transition-colors",
                  annual ? "bg-primary" : "bg-border",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-2.5 rounded-full bg-background transition-[left] duration-200",
                    annual ? "left-3" : "left-0.5",
                  )}
                />
              </span>
              Annual
            </button>
          </header>

          <ul className="flex flex-col gap-5">
            {lines.map(({ meter, used, cost }) => (
              <li key={meter.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={`meter-${meter.id}`} className="text-[0.82rem] font-medium">
                    {meter.label}
                  </label>
                  <span className="font-mono text-[0.75rem] tabular-nums text-muted-foreground">
                    {used.toLocaleString()} {meter.unit}
                  </span>
                </div>

                <input
                  id={`meter-${meter.id}`}
                  type="range"
                  min={meter.min}
                  max={meter.max}
                  step={meter.step}
                  value={used}
                  onChange={(event) =>
                    setValues((prev) => ({ ...prev, [meter.id]: Number(event.target.value) }))
                  }
                  aria-describedby={`meter-${meter.id}-cost`}
                  className={cn(
                    "mt-2 h-1.5 w-full cursor-ew-resize appearance-none rounded-full bg-border accent-primary",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  )}
                />

                <p id={`meter-${meter.id}-cost`} className="mt-1.5 text-[0.68rem] text-muted-foreground">
                  {meter.free.toLocaleString()} {meter.unit || "seats"} included · {rate(meter.rate)} per{" "}
                  {meter.unit || "seat"} after ·{" "}
                  <span className="tabular-nums text-foreground/80">{money(cost)}</span>
                </p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="flex flex-col rounded-xl border border-border bg-background/40 p-5">
          <p className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">
            {annual ? "Billed annually" : "Billed monthly"}
          </p>
          <p className="mt-2 flex items-baseline gap-1">
            <span ref={totalRef} data-value="0" className="text-4xl font-light tabular-nums">
              {money(charged)}
            </span>
            <span className="text-[0.8rem] text-muted-foreground">/ mo</span>
          </p>
          {annual ? (
            <p className="mt-1 text-[0.7rem] text-primary">
              {12 - annualMonths} months free · {money(monthly * 12 - charged * 12)} saved a year
            </p>
          ) : null}

          <dl className="mt-5 flex flex-col gap-2 border-t border-border pt-4 text-[0.75rem]">
            {lines.map(({ meter, billable, cost }) => (
              <div key={meter.id} className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">
                  {meter.label}
                  {billable > 0 ? (
                    <span className="ml-1 text-muted-foreground/60">
                      ({billable.toLocaleString()} over)
                    </span>
                  ) : (
                    <span className="ml-1 text-muted-foreground/60">(included)</span>
                  )}
                </dt>
                <dd className="tabular-nums">{money(cost)}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto pt-5">
            <p className="text-[0.62rem] uppercase tracking-[0.14em] text-muted-foreground">Suggested plan</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
              {tier.name}
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[0.6rem] font-medium text-primary">
                best fit
              </span>
            </p>
            <p className="mt-1 text-[0.7rem] text-muted-foreground">{tier.blurb}</p>

            <button
              type="button"
              className={cn(
                "mt-4 w-full rounded-lg bg-primary px-4 py-2 text-[0.8rem] font-semibold text-primary-foreground",
                "transition-transform hover:scale-[1.02] active:scale-100",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
              )}
            >
              Start on {tier.name}
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}
