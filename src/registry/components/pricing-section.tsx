"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PricingTier {
  name: string
  price: { monthly: number; yearly: number }
  description: string
  features: string[]
  cta: string
  popular?: boolean
}

export function PricingSection({
  tiers,
  title = "Simple, transparent pricing",
  subtitle = "Choose the plan that fits how you build.",
}: {
  tiers: PricingTier[]
  title?: string
  subtitle?: string
}) {
  const [yearly, setYearly] = React.useState(true)

  return (
    <section className="w-full px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h2>
          <p className="max-w-xl text-white/50">{subtitle}</p>

          <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
            {(["Monthly", "Yearly"] as const).map((label, i) => (
              <button
                key={label}
                onClick={() => setYearly(i === 1)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition",
                  (i === 1) === yearly ? "bg-white text-black" : "text-white/60 hover:text-white"
                )}
              >
                {label}
                {i === 1 && <span className="ml-1.5 text-[11px] opacity-70">−25%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                tier.popular
                  ? "border-white/25 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_30px_80px_-20px_rgba(0,0,0,0.9)]"
                  : "border-white/10 bg-white/[0.02]"
              )}
            >
              {tier.popular && (
                <span className="absolute -top-2.5 left-6 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-black">
                  Popular
                </span>
              )}
              <h3 className="text-sm font-semibold text-white">{tier.name}</h3>
              <p className="mt-1 text-sm text-white/45">{tier.description}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight text-white">
                  ${yearly ? tier.price.yearly : tier.price.monthly}
                </span>
                <span className="text-sm text-white/40">/mo</span>
              </div>
              <button
                className={cn(
                  "mt-5 h-10 w-full rounded-lg text-sm font-medium transition",
                  tier.popular
                    ? "bg-white text-black hover:bg-white/90"
                    : "border border-white/15 text-white hover:bg-white/5"
                )}
              >
                {tier.cta}
              </button>
              <ul className="mt-6 space-y-2.5">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                    <Check className="mt-0.5 size-4 shrink-0 text-white/40" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
