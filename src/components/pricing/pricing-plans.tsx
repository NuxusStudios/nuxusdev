"use client"

import * as React from "react"
import { Check, Tag } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Cycle = "quarterly" | "yearly"

const CREDIT_TIERS = [500, 1000, 2000] as const

interface Plan {
  id: string
  name: string
  blurb: string
  price: Record<Cycle, number>
  unit?: string
  cta: string
  popular?: boolean
  seats?: string
  features: { label: string; note?: string }[]
  credits?: boolean
}

const PLANS: Plan[] = [
  {
    id: "builder",
    name: "Builder",
    blurb: "For individuals.",
    price: { quarterly: 8, yearly: 6 },
    cta: "Get Builder plan",
    features: [
      { label: "Unlimited code & prompt copies" },
      { label: "29,000 icons, searched by meaning" },
      { label: "Search components via MCP & CLI" },
      { label: "Create unlimited shaders, gradients & ASCII art" },
      { label: "5 free Design Bug Bot reviews", note: "After 5 reviews or 7 days, add AI to continue." },
      { label: "Unlimited component installs" },
      { label: "Unlimited installs via MCP & CLI" },
    ],
  },
  {
    id: "builder-ai",
    name: "Builder + AI",
    blurb: "Build with AI. Review every PR.",
    price: { quarterly: 20, yearly: 15 },
    cta: "Get Builder + AI plan",
    popular: true,
    credits: true,
    features: [
      { label: "Design Bug Bot included", note: "Find design issues in PRs and get fix code. Uses AI credits after 5 free reviews or 7 days." },
      { label: "Everything in Builder" },
      { label: "Create with multiple AI models" },
      { label: "Premium AI models" },
    ],
  },
  {
    id: "team",
    name: "Team",
    blurb: "For agencies and businesses.",
    price: { quarterly: 10, yearly: 7.5 },
    unit: "per seat / month",
    seats: "2–50 seats",
    cta: "Get Team plan",
    features: [
      { label: "Design Bug Bot for your team", note: "5 free reviews per team. After 5 reviews or 7 days, uses Team + AI credits." },
      { label: "Centralized billing" },
      { label: "Shared collections" },
      { label: "Admin controls" },
      { label: "Private team components" },
      { label: "Optional AI credits per seat" },
    ],
  },
]

export function PricingPlans() {
  const [cycle, setCycle] = React.useState<Cycle>("yearly")
  const [credits, setCredits] = React.useState<(typeof CREDIT_TIERS)[number]>(500)

  return (
    <>
      <div className="mt-9 flex justify-center">
        <div className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 p-1">
          {(["quarterly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                "rounded-full px-4 py-1.5 text-[13px] font-medium capitalize transition-colors",
                cycle === c ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {c}
              {c === "yearly" && (
                <span className="ml-1.5 text-[11px] opacity-70">· Save 25%</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border p-6",
              plan.popular
                ? "border-border-strong bg-card shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_40px_90px_-30px_rgba(0,0,0,0.9)]"
                : "border-border bg-card/60"
            )}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-6 rounded-full bg-foreground px-2.5 py-0.5 text-[11px] font-semibold text-background">
                Popular
              </span>
            )}

            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold">{plan.name}</h2>
              {plan.seats && (
                <span className="text-xs text-muted-foreground">{plan.seats}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="text-[2.75rem] font-semibold leading-none tracking-tight">
                ${plan.price[cycle] % 1 === 0 ? plan.price[cycle] : plan.price[cycle].toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">
                {plan.unit ?? "per month"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground/70">
              billed {cycle === "yearly" ? "yearly" : "quarterly"}
            </p>

            <Button
              className="mt-5 w-full"
              variant={plan.popular ? "default" : "secondary"}
              onClick={() => toast(`${plan.name} selected`, { description: "Checkout is a demo in this build." })}
            >
              {plan.cta}
            </Button>

            {plan.credits && (
              <div className="mt-5 rounded-xl border border-border bg-secondary/30 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-muted-foreground">AI credits / mo</span>
                  <div className="flex gap-1">
                    {CREDIT_TIERS.map((tier) => (
                      <button
                        key={tier}
                        onClick={() => setCredits(tier)}
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[12px] tabular-nums transition-colors",
                          credits === tier
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {tier >= 1000 ? `${tier / 1000}K` : tier}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f.label} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                  <span className="text-[13px] leading-relaxed">
                    {f.label}
                    {f.note && (
                      <span className="mt-0.5 block text-[12px] text-muted-foreground">{f.note}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => toast("Promo codes are applied at checkout")}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Tag className="size-3.5" />
          Have a promo code?
        </button>
      </div>
    </>
  )
}
