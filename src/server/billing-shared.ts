import "server-only"
import { eq } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { env } from "@/server/env"
import { stripe } from "@/server/stripe"

/**
 * Checkout helpers shared by plan and template purchases.
 *
 * They live here rather than beside the actions because a "use server"
 * module may only export async server actions — a sync helper exported from
 * one fails the build, and the error names the file rather than the rule.
 */

/** The origin to send Stripe back to — taken from config, never from the request. */
export function siteOrigin(): string {
  return env.siteUrl.replace(/\/$/, "")
}

/**
 * Finds or creates the Stripe customer for this user.
 *
 * The user id goes into customer metadata as well as the subscription, so a
 * webhook can always resolve back to an account even if one link is missing.
 */
export async function customerIdFor(user: { id: string; email: string; name: string }): Promise<string> {
  const [row] = await db
    .select({ stripeCustomerId: schema.user.stripeCustomerId })
    .from(schema.user)
    .where(eq(schema.user.id, user.id))
    .limit(1)

  if (row?.stripeCustomerId) return row.stripeCustomerId

  const customer = await stripe().customers.create({
    email: user.email,
    name: user.name,
    metadata: { userId: user.id },
  })

  await db
    .update(schema.user)
    .set({ stripeCustomerId: customer.id })
    .where(eq(schema.user.id, user.id))

  return customer.id
}
