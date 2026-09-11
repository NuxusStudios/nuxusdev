import "server-only"
import Stripe from "stripe"
import { env } from "@/server/env"
import type { PlanId } from "@/lib/plans"

/**
 * Stripe client and the plan → price mapping.
 *
 * Card details never reach this server: checkout happens on Stripe's hosted
 * page, and we only ever see the resulting subscription through webhooks.
 */

let client: Stripe | null = null

export function stripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured")
  }
  client ??= new Stripe(env.STRIPE_SECRET_KEY, {
    // pinned so a Stripe-side API change can't alter behaviour silently
    apiVersion: "2026-08-26.dahlia",
    typescript: true,
    appInfo: { name: "Nuxus", version: "1.0.0" },
  })
  return client
}

export type BillingCycle = "quarterly" | "yearly"

/** Plans that can actually be bought — `free` has no price, by definition. */
export type PurchasablePlan = Exclude<PlanId, "free">

/** Monthly AI credit tiers sold with Builder + AI. */
export const CREDIT_TIERS = [500, 1000, 2000] as const
export type CreditTier = (typeof CREDIT_TIERS)[number]

interface PriceEntry {
  id: string | undefined
  plan: PurchasablePlan
  cycle: BillingCycle
  /** only set for Builder + AI, where the tier changes the price */
  credits?: CreditTier
}

/**
 * Every sellable price. Builder + AI has one per credit tier because the tier
 * changes what a customer pays; the others are flat per cycle.
 */
const PRICES: PriceEntry[] = [
  { id: env.STRIPE_PRICE_BUILDER_QUARTERLY, plan: "builder", cycle: "quarterly" },
  { id: env.STRIPE_PRICE_BUILDER_YEARLY, plan: "builder", cycle: "yearly" },

  { id: env.STRIPE_PRICE_BUILDER_AI_QUARTERLY_500, plan: "builder_ai", cycle: "quarterly", credits: 500 },
  { id: env.STRIPE_PRICE_BUILDER_AI_QUARTERLY_1000, plan: "builder_ai", cycle: "quarterly", credits: 1000 },
  { id: env.STRIPE_PRICE_BUILDER_AI_QUARTERLY_2000, plan: "builder_ai", cycle: "quarterly", credits: 2000 },
  { id: env.STRIPE_PRICE_BUILDER_AI_YEARLY_500, plan: "builder_ai", cycle: "yearly", credits: 500 },
  { id: env.STRIPE_PRICE_BUILDER_AI_YEARLY_1000, plan: "builder_ai", cycle: "yearly", credits: 1000 },
  { id: env.STRIPE_PRICE_BUILDER_AI_YEARLY_2000, plan: "builder_ai", cycle: "yearly", credits: 2000 },

  { id: env.STRIPE_PRICE_TEAM_QUARTERLY, plan: "team", cycle: "quarterly" },
  { id: env.STRIPE_PRICE_TEAM_YEARLY, plan: "team", cycle: "yearly" },

  { id: env.STRIPE_PRICE_TEAM_AI_QUARTERLY_500, plan: "team_ai", cycle: "quarterly", credits: 500 },
  { id: env.STRIPE_PRICE_TEAM_AI_QUARTERLY_1000, plan: "team_ai", cycle: "quarterly", credits: 1000 },
  { id: env.STRIPE_PRICE_TEAM_AI_QUARTERLY_2000, plan: "team_ai", cycle: "quarterly", credits: 2000 },
  { id: env.STRIPE_PRICE_TEAM_AI_YEARLY_500, plan: "team_ai", cycle: "yearly", credits: 500 },
  { id: env.STRIPE_PRICE_TEAM_AI_YEARLY_1000, plan: "team_ai", cycle: "yearly", credits: 1000 },
  { id: env.STRIPE_PRICE_TEAM_AI_YEARLY_2000, plan: "team_ai", cycle: "yearly", credits: 2000 },
]

export function priceIdFor(
  plan: PurchasablePlan,
  cycle: BillingCycle,
  credits?: CreditTier
): string | undefined {
  return PRICES.find(
    (price) =>
      price.id &&
      price.plan === plan &&
      price.cycle === cycle &&
      (plan === "builder_ai" || plan === "team_ai" ? price.credits === credits : true)
  )?.id
}

/** Which plans have at least one price configured, so the UI can hide the rest. */
export function purchasablePlans(): PurchasablePlan[] {
  const plans = new Set(PRICES.filter((price) => price.id).map((price) => price.plan))
  return [...plans]
}

/**
 * Maps a Stripe price back to a plan and credit tier. The webhook trusts this
 * rather than any value sent by the client, so a tampered checkout request
 * cannot buy one plan at another's price.
 */
export function planForPriceId(
  priceId: string
): { plan: PurchasablePlan; credits: number } | null {
  const match = PRICES.find((price) => price.id === priceId)
  if (!match) return null
  return { plan: match.plan, credits: match.credits ?? 0 }
}

/** Stripe subscription status → the status column on our subscription row. */
export function normalizeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case "active":
    case "trialing":
      return status
    case "past_due":
    case "unpaid":
      return "past_due"
    default:
      return "canceled"
  }
}
