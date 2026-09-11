import "server-only"
import { and, desc, eq, inArray } from "drizzle-orm"
import { cache } from "react"
import { db, schema } from "@/server/db"
import { getCurrentUser } from "@/server/session"
import { FREE_PLAN, isPlanId, PLANS, type Plan, type PlanId } from "@/lib/plans"

/**
 * What the current visitor is allowed to do.
 *
 * This is the only place plan access is decided. Every gate — copy buttons,
 * source payloads, CLI commands, the registry API — reads from here, on the
 * server. Nothing about entitlement is ever decided in the browser.
 */
export interface Entitlements {
  signedIn: boolean
  plan: Plan
  /** monthly AI credits from the purchased tier, not the plan default */
  aiCredits: number
  /** source, prompts and CLI commands */
  canCopy: boolean
  canUseRegistryApi: boolean
  /** why access was refused, for the upgrade prompt */
  reason: "signed_out" | "no_plan" | null
}

const ACTIVE_STATUSES = ["active", "trialing"] as const

/** The plan a user is currently paying for, or free. */
async function resolvePlan(userId: string): Promise<{ plan: PlanId; aiCredits: number }> {
  const [row] = await db
    .select({
      plan: schema.subscription.plan,
      periodEnd: schema.subscription.currentPeriodEnd,
      aiCredits: schema.subscription.aiCredits,
    })
    .from(schema.subscription)
    .where(
      and(
        eq(schema.subscription.userId, userId),
        inArray(schema.subscription.status, [...ACTIVE_STATUSES])
      )
    )
    .orderBy(desc(schema.subscription.createdAt))
    .limit(1)

  if (!row) return { plan: "free", aiCredits: 0 }

  // a period that has already ended doesn't entitle anything, whatever the
  // status column says — the provider webhook may simply not have arrived yet
  if (row.periodEnd && row.periodEnd.getTime() < Date.now()) {
    return { plan: "free", aiCredits: 0 }
  }

  return {
    plan: isPlanId(row.plan) ? row.plan : "free",
    aiCredits: row.aiCredits ?? 0,
  }
}

export const getEntitlements = cache(async (): Promise<Entitlements> => {
  const user = await getCurrentUser()

  if (!user) {
    return {
      signedIn: false,
      plan: FREE_PLAN,
      aiCredits: 0,
      canCopy: false,
      canUseRegistryApi: false,
      reason: "signed_out",
    }
  }

  const { plan: planId, aiCredits } = await resolvePlan(user.id)
  const plan = PLANS[planId]

  return {
    signedIn: true,
    plan,
    aiCredits: aiCredits || plan.aiCredits,
    canCopy: plan.canCopy,
    canUseRegistryApi: plan.canUseRegistryApi,
    reason: plan.canCopy ? null : "no_plan",
  }
})

export class PaymentRequiredError extends Error {
  constructor(public reason: "signed_out" | "no_plan") {
    super(
      reason === "signed_out"
        ? "Sign in and choose a plan to copy components."
        : "Copying components requires a paid plan."
    )
    this.name = "PaymentRequiredError"
  }
}

/** Throws unless the caller may copy source, prompts or CLI commands. */
export async function requireCopyAccess(): Promise<Entitlements> {
  const entitlements = await getEntitlements()
  if (!entitlements.canCopy) {
    throw new PaymentRequiredError(entitlements.reason ?? "no_plan")
  }
  return entitlements
}
