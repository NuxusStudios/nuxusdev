"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, Clock, ExternalLink, Loader2, Tag } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { openBillingPortal, startCheckout } from "@/server/actions/billing"
import { TeamDialog } from "@/components/pricing/team-dialog"
import { monthlyPrice } from "@/lib/pricing"
import type { PlanId } from "@/lib/plans"
import { cn } from "@/lib/utils"

type Cycle = "quarterly" | "yearly"

const CREDIT_TIERS = [500, 1000, 2000] as const

type CreditTier = (typeof CREDIT_TIERS)[number]

interface Plan {
  id: PlanId
  name: string
  blurb: string
  unit?: string
  cta: string
  popular?: boolean
  seats?: string
  features: { label: string; note?: string; soon?: boolean }[]
  credits?: boolean
}

/** Monthly price shown for a plan, from the shared catalogue. */
function displayPrice(plan: Plan, cycle: Cycle, credits: CreditTier): number {
  return monthlyPrice(plan.id, cycle, plan.credits ? credits : undefined)
}

const PLANS: Plan[] = [
  {
    id: "builder" as const,
    name: "Builder",
    blurb: "For individuals.",
    cta: "Get Builder plan",
    features: [
      { label: "Unlimited code & prompt copies" },
      { label: "6,000+ icons, searched by meaning" },
      { label: "Search components via MCP & CLI" },
      { label: "Create unlimited shaders, gradients & ASCII art" },
      { label: "Design Bug Bot", note: "In development — not yet available.", soon: true },
      { label: "Unlimited component installs" },
      { label: "Unlimited installs via MCP & CLI" },
    ],
  },
  {
    id: "builder_ai" as const,
    name: "Builder + AI",
    blurb: "Build with AI. Review every PR.",
    cta: "Get Builder + AI plan",
    popular: true,
    credits: true,
    features: [
      { label: "Design Bug Bot", note: "In development — not yet available.", soon: true },
      { label: "Everything in Builder" },
      { label: "Create with multiple AI models", note: "In development — not yet available.", soon: true },
      { label: "Premium AI models", note: "In development — not yet available.", soon: true },
    ],
  },
  {
    id: "team" as const,
    name: "Team",
    blurb: "For agencies and businesses.",
    unit: "per seat / month",
    seats: "2–50 seats",
    cta: "Get Team plan",
    features: [
      { label: "Design Bug Bot for your team", note: "In development — not yet available.", soon: true },
      { label: "Centralized billing" },
      { label: "Shared collections" },
      { label: "Admin controls" },
      { label: "Private team components" },
      { label: "Optional AI credits per seat" },
    ],
  },
]

export function PricingPlans({
  currentPlan = "free",
  signedIn = false,
  billingEnabled = false,
  purchasable = [],
}: {
  currentPlan?: PlanId
  signedIn?: boolean
  billingEnabled?: boolean
  purchasable?: string[]
}) {
  const [cycle, setCycle] = React.useState<Cycle>("yearly")
  const [credits, setCredits] = React.useState<(typeof CREDIT_TIERS)[number]>(500)
  const [pending, setPending] = React.useState<string | null>(null)
  const [teamOpen, setTeamOpen] = React.useState(false)
  const router = useRouter()

  async function choose(plan: Plan) {
    // Team is bought by seat, and with or without AI credits — that needs a
    // choice before Stripe, so it opens a dialog rather than checking out.
    if (plan.id === "team" && currentPlan !== "team" && currentPlan !== "team_ai") {
      setTeamOpen(true)
      return
    }

    if (!signedIn) {
      router.push(`/sign-up?next=${encodeURIComponent("/pricing")}`)
      return
    }

    if (!billingEnabled) {
      toast.error("Billing isn't switched on yet.")
      return
    }

    // already on this plan — send them to Stripe to manage it instead
    if (currentPlan === plan.id || (plan.id === "team" && currentPlan === "team_ai")) {
      setPending(plan.id)
      const result = await openBillingPortal()
      setPending(null)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      window.location.assign(result.data.url)
      return
    }

    if (!purchasable.includes(plan.id)) {
      toast.error(`${plan.name} isn't available for purchase yet.`)
      return
    }

    setPending(plan.id)
    const result = await startCheckout({
      plan: plan.id as "builder" | "builder_ai" | "team",
      cycle,
      seats: plan.id === "team" ? 2 : 1,
      credits: plan.id === "builder_ai" ? credits : undefined,
    })
    setPending(null)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    // hand off to Stripe's hosted checkout
    window.location.assign(result.data.url)
  }

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
                <span className="ml-1.5 text-[11px] opacity-70">· Save up to 29%</span>
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
                ${displayPrice(plan, cycle, credits)}
              </span>
              <span className="text-sm text-muted-foreground">
                {plan.unit ?? "per month"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground/70">
              billed {cycle === "yearly" ? "yearly" : "quarterly"}
            </p>

            <Button
              className="mt-5 w-full gap-1.5"
              variant={plan.popular ? "default" : "secondary"}
              disabled={pending !== null}
              onClick={() => choose(plan)}
            >
              {pending === plan.id && <Loader2 className="size-4 animate-spin" />}
              {currentPlan === plan.id ? (
                <>
                  Manage billing
                  <ExternalLink className="size-3.5" />
                </>
              ) : (
                plan.cta
              )}
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
                  {f.soon ? (
                    <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground/40" />
                  ) : (
                    <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                  )}
                  <span
                    className={cn(
                      "text-[13px] leading-relaxed",
                      f.soon && "text-muted-foreground"
                    )}
                  >
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

      <TeamDialog
        key={teamOpen ? "team-open" : "team-closed"}
        open={teamOpen}
        onOpenChange={setTeamOpen}
        cycle={cycle}
        signedIn={signedIn}
        billingEnabled={billingEnabled}
        onNeedsAccount={() => {
          setTeamOpen(false)
          router.push(`/sign-up?next=${encodeURIComponent("/pricing")}`)
        }}
      />

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
