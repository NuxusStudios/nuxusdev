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

const PRICE_IDS: Record<PurchasablePlan, Record<BillingCycle, string | undefined>> = {
  builder: {
    quarterly: env.STRIPE_PRICE_BUILDER_QUARTERLY,
    yearly: env.STRIPE_PRICE_BUILDER_YEARLY,
  },
  builder_ai: {
    quarterly: env.STRIPE_PRICE_BUILDER_AI_QUARTERLY,
    yearly: env.STRIPE_PRICE_BUILDER_AI_YEARLY,
  },
  team: {
    quarterly: env.STRIPE_PRICE_TEAM_QUARTERLY,
    yearly: env.STRIPE_PRICE_TEAM_YEARLY,
  },
}

export function priceIdFor(plan: PurchasablePlan, cycle: BillingCycle): string | undefined {
  return PRICE_IDS[plan][cycle]
}

/** Which plans have a price configured, so the UI can hide the rest. */
export function purchasablePlans(): PurchasablePlan[] {
  return (Object.keys(PRICE_IDS) as PurchasablePlan[]).filter((plan) =>
    Object.values(PRICE_IDS[plan]).some(Boolean)
  )
}

/**
 * Maps a Stripe price back to one of our plans. The webhook trusts this rather
 * than any value sent by the client.
 */
export function planForPriceId(priceId: string): PurchasablePlan | null {
  for (const plan of Object.keys(PRICE_IDS) as PurchasablePlan[]) {
    for (const cycle of ["quarterly", "yearly"] as BillingCycle[]) {
      if (PRICE_IDS[plan][cycle] === priceId) return plan
    }
  }
  return null
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
