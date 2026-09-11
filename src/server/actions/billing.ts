"use server"

import { eq } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/server/db"
import { env, providers } from "@/server/env"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import { priceIdFor, stripe, type BillingCycle, type PurchasablePlan } from "@/server/stripe"
import { PLANS } from "@/lib/plans"

const inputSchema = z.object({
  plan: z.enum(["builder", "builder_ai", "team"]),
  cycle: z.enum(["quarterly", "yearly"]),
  seats: z.number().int().min(1).max(50).default(1),
})

/** The origin to send Stripe back to — taken from config, never from the request. */
function siteOrigin(): string {
  return env.siteUrl.replace(/\/$/, "")
}

/**
 * Finds or creates the Stripe customer for this user.
 *
 * The user id goes into customer metadata as well as the subscription, so a
 * webhook can always resolve back to an account even if one link is missing.
 */
async function customerIdFor(user: { id: string; email: string; name: string }): Promise<string> {
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

/**
 * Starts a hosted Stripe Checkout session and returns its URL.
 *
 * Card details are entered on Stripe's page, not ours — this server never sees
 * a card number, which keeps the deployment out of PCI scope.
 */
export async function startCheckout(input: z.input<typeof inputSchema>) {
  return run(async () => {
    const user = await requireUser()

    if (!providers.billing) {
      throw new ValidationError("Billing isn't configured yet.")
    }

    enforceRateLimit(`checkout:${user.id}`, { max: 10, windowSeconds: 600 })

    const parsed = inputSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError("That plan isn't available.")
    const { plan, cycle, seats } = parsed.data

    const priceId = priceIdFor(plan as PurchasablePlan, cycle as BillingCycle)
    if (!priceId) {
      throw new ValidationError(`${PLANS[plan].name} isn't available on that billing cycle yet.`)
    }

    const customer = await customerIdFor({
      id: user.id,
      email: user.email,
      name: user.name ?? user.email,
    })

    const origin = siteOrigin()

    const session = await stripe().checkout.sessions.create(
      {
        mode: "subscription",
        customer,
        line_items: [{ price: priceId, quantity: plan === "team" ? seats : 1 }],

        // two independent ways for the webhook to find the account
        client_reference_id: user.id,
        subscription_data: { metadata: { userId: user.id, plan } },
        metadata: { userId: user.id, plan },

        success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing?checkout=cancelled`,

        allow_promotion_codes: true,
        billing_address_collection: "auto",
        automatic_tax: { enabled: false },
      },
      // a double-clicked button must not create two subscriptions
      { idempotencyKey: `checkout:${user.id}:${plan}:${cycle}:${seats}` }
    )

    if (!session.url) throw new ValidationError("Stripe did not return a checkout URL.")

    return { url: session.url }
  })
}

/**
 * Opens Stripe's billing portal so a customer can change payment method,
 * switch plan or cancel — all handled by Stripe, reflected back via webhook.
 */
export async function openBillingPortal() {
  return run(async () => {
    const user = await requireUser()

    if (!providers.billing) {
      throw new ValidationError("Billing isn't configured yet.")
    }

    enforceRateLimit(`portal:${user.id}`, { max: 20, windowSeconds: 600 })

    const [row] = await db
      .select({ stripeCustomerId: schema.user.stripeCustomerId })
      .from(schema.user)
      .where(eq(schema.user.id, user.id))
      .limit(1)

    if (!row?.stripeCustomerId) {
      throw new ValidationError("You don't have a billing account yet.")
    }

    const session = await stripe().billingPortal.sessions.create({
      customer: row.stripeCustomerId,
      return_url: `${siteOrigin()}/pricing`,
    })

    return { url: session.url }
  })
}
