import catalogue from "@/lib/pricing.json"

/**
 * Single source of truth for what everything costs.
 *
 * The same file is read by scripts/stripe-setup.mjs when it creates the Stripe
 * prices, so a number shown on the pricing page cannot drift away from the
 * amount a customer is actually charged.
 */

export type Cycle = "quarterly" | "yearly"
export type CreditTier = 500 | 1000 | 2000

interface CataloguePrice {
  cycle: string
  credits?: number
  monthly: number
}

interface CataloguePlan {
  id: string
  name: string
  description: string
  perSeat: boolean
  prices: CataloguePrice[]
}

const PLANS = catalogue.plans as CataloguePlan[]

export const MONTHS_PER_CYCLE = catalogue.monthsPerCycle as Record<Cycle, number>

function find(planId: string, cycle: Cycle, credits?: number): number {
  const plan = PLANS.find((entry) => entry.id === planId)
  const price = plan?.prices.find(
    (entry) => entry.cycle === cycle && (credits ? entry.credits === credits : !entry.credits)
  )
  if (!price) {
    throw new Error(`No price for ${planId} / ${cycle}${credits ? ` / ${credits}` : ""}`)
  }
  return price.monthly
}

/** Displayed monthly price — per seat for the team plans. */
export function monthlyPrice(planId: string, cycle: Cycle, credits?: number): number {
  return find(planId, cycle, credits)
}

/** What Stripe actually charges for one billing period. */
export function periodTotal(
  planId: string,
  cycle: Cycle,
  { credits, seats = 1 }: { credits?: number; seats?: number } = {}
): number {
  return find(planId, cycle, credits) * seats * MONTHS_PER_CYCLE[cycle]
}

export const CREDIT_TIERS: CreditTier[] = [500, 1000, 2000]
