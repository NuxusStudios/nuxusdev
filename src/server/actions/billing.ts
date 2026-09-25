"use server"

import { eq } from "drizzle-orm"
import { z } from "zod"
import { db, schema } from "@/server/db"
import { providers } from "@/server/env"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import { priceIdFor, stripe, type BillingCycle, type PurchasablePlan } from "@/server/stripe"
import { customerIdFor, siteOrigin } from "@/server/billing-shared"
import { PLANS } from "@/lib/plans"

const inputSchema = z.object({
  plan: z.enum(["builder", "builder_ai", "team", "team_ai"]),
  cycle: z.enum(["quarterly", "yearly"]),
  seats: z.number().int().min(1).max(50).default(1),
  /** Builder + AI only — the tier selects a different price */
  credits: z.union([z.literal(500), z.literal(1000), z.literal(2000)]).optional(),
})



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
    const { plan, cycle, seats, credits } = parsed.data

    if ((plan === "builder_ai" || plan === "team_ai") && !credits) {
      throw new ValidationError("Choose how many AI credits you need.")
    }

    const priceId = priceIdFor(plan as PurchasablePlan, cycle as BillingCycle, credits)
    if (!priceId) {
      throw new ValidationError(
        credits
          ? `${PLANS[plan].name} with ${credits} credits isn't available on that cycle yet.`
          : `${PLANS[plan].name} isn't available on that billing cycle yet.`
      )
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
        line_items: [{ price: priceId, quantity: plan.startsWith("team") ? seats : 1 }],

        // two independent ways for the webhook to find the account
        client_reference_id: user.id,
        subscription_data: { metadata: { userId: user.id, plan } },
        metadata: { userId: user.id, plan, credits: String(credits ?? "") },

        success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing?checkout=cancelled`,

        allow_promotion_codes: true,
        billing_address_collection: "auto",
        // No automatic_tax here. Accounts with Managed Payments — the default
        // for new Stripe accounts — reject the whole request if it is passed as
        // false, because Stripe is handling tax itself. Omitting it works on
        // both kinds of account, which passing `true` would not.
      },
      // A double-clicked button must not create two subscriptions, but the key
      // has to name an attempt rather than the purchase for all time. Stripe
      // remembers a key for 24 hours and refuses it if the parameters differ,
      // so a permanent key means changing anything about this call locks out
      // everyone who has ever pressed the button — and locks out any customer
      // who cancels and resubscribes to the same plan. A minute is long enough
      // to swallow a double click and short enough to never be in the way.
      {
        idempotencyKey:
          `checkout:${user.id}:${plan}:${cycle}:${seats}:${credits ?? 0}` +
          `:${Math.floor(Date.now() / 60_000)}`,
      }
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
