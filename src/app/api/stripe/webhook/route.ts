import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { and, eq } from "drizzle-orm"
import type Stripe from "stripe"
import { db, schema } from "@/server/db"
import { env } from "@/server/env"
import { normalizeStatus, planForPriceId, stripe } from "@/server/stripe"

/**
 * Stripe webhook — the only thing that grants a plan.
 *
 * Entitlement is never decided from anything the browser sends. A user returning
 * from checkout proves nothing; this endpoint, verified against Stripe's
 * signature, is the sole writer of subscription rows.
 */

// the signature is computed over the raw body, so it must not be parsed first
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const HANDLED: Stripe.Event.Type[] = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]

export async function POST(request: Request) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("[stripe] webhook received but STRIPE_WEBHOOK_SECRET is not set")
    return new NextResponse("Billing is not configured", { status: 500 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return new NextResponse("Missing signature", { status: 400 })
  }

  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    // an unverifiable payload is either a misconfiguration or someone probing
    console.error(
      "[stripe] signature verification failed:",
      error instanceof Error ? error.message : error
    )
    return new NextResponse("Invalid signature", { status: 400 })
  }

  if (!HANDLED.includes(event.type)) {
    // acknowledged so Stripe stops retrying events we don't act on
    return NextResponse.json({ received: true, handled: false })
  }

  try {
    await handle(event)
  } catch (error) {
    // a 500 tells Stripe to retry, which is what we want for a transient fault
    console.error(`[stripe] failed to handle ${event.type}:`, error)
    return new NextResponse("Handler error", { status: 500 })
  }

  return NextResponse.json({ received: true, handled: true })
}

async function handle(event: Stripe.Event): Promise<void> {
  // a one-off template sale is a completed session with no subscription
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.mode === "payment") {
      await recordTemplatePurchase(session)
      return
    }
  }

  const subscriptionId = await subscriptionIdFrom(event)
  if (!subscriptionId) {
    console.warn(`[stripe] ${event.type} carried no subscription id`)
    return
  }

  // Re-fetch rather than trusting the payload: the event may be out of order or
  // stale, and Stripe's current state is the only thing worth writing down.
  const subscription = await stripe().subscriptions.retrieve(subscriptionId)
  const userId = await resolveUserId(subscription)

  if (!userId) {
    console.error(`[stripe] could not map subscription ${subscriptionId} to a user`)
    return
  }

  const item = subscription.items.data[0]
  const priceId = item?.price?.id
  const matched = priceId ? planForPriceId(priceId) : null

  if (!matched) {
    console.error(`[stripe] price ${priceId} does not map to a known plan`)
    return
  }

  const { plan, credits } = matched

  const status = normalizeStatus(subscription.status)
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000)
    : null

  // One row per Stripe subscription: update in place so retries are idempotent.
  const [existing] = await db
    .select({ id: schema.subscription.id })
    .from(schema.subscription)
    .where(eq(schema.subscription.providerSubscriptionId, subscription.id))
    .limit(1)

  const values = {
    userId,
    plan,
    status,
    seats: item?.quantity ?? 1,
    aiCredits: credits,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
    provider: "stripe",
    providerCustomerId:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id,
    providerSubscriptionId: subscription.id,
    updatedAt: new Date(),
  }

  if (existing) {
    await db
      .update(schema.subscription)
      .set(values)
      .where(eq(schema.subscription.id, existing.id))
  } else {
    // retire any other active row for this user so entitlement is unambiguous
    await db
      .update(schema.subscription)
      .set({ status: "canceled", updatedAt: new Date() })
      .where(
        and(
          eq(schema.subscription.userId, userId),
          eq(schema.subscription.status, "active")
        )
      )

    await db.insert(schema.subscription).values({ id: randomUUID(), ...values })
  }

  console.log(
    `[stripe] ${event.type}: user ${userId} → ${plan}` +
      (credits ? ` ${credits} credits` : "") +
      ` (${status})` +
      (periodEnd ? `, renews ${periodEnd.toISOString().slice(0, 10)}` : "")
  )
}

/**
 * Grants a purchased template.
 *
 * Only ever called for a session Stripe has told us is paid, and the row is
 * keyed on the session id, so a redelivered or duplicated event is a no-op
 * rather than a second grant. The amount stored is what Stripe charged, not
 * what our catalogue currently says — a later price change must not rewrite
 * somebody's receipt.
 */
async function recordTemplatePurchase(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") {
    console.warn(`[stripe] template session ${session.id} is ${session.payment_status}, ignoring`)
    return
  }

  const slug = session.metadata?.templateSlug
  const userId = session.metadata?.userId ?? session.client_reference_id

  if (!slug || !userId) {
    console.error(`[stripe] template session ${session.id} is missing slug or user`)
    return
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null)

  try {
    await db.insert(schema.templatePurchase).values({
      id: randomUUID(),
      userId,
      templateSlug: slug,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      stripeSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
    })

    console.info(`[stripe] template purchased: ${userId} → ${slug}`)
  } catch (error) {
    // the unique index on the session id is the idempotency guarantee, so a
    // duplicate here means Stripe retried and the grant already exists
    const message = error instanceof Error ? error.message : String(error)
    if (message.includes("Duplicate") || message.includes("UNIQUE")) {
      console.info(`[stripe] template session ${session.id} already recorded`)
      return
    }
    throw error
  }
}

async function subscriptionIdFrom(event: Stripe.Event): Promise<string | null> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    if (typeof session.subscription === "string") return session.subscription
    return session.subscription?.id ?? null
  }

  const subscription = event.data.object as Stripe.Subscription
  return subscription.id ?? null
}

/**
 * Resolves the account behind a subscription, in order of reliability:
 * the metadata we set at checkout, then the stored customer id, then the
 * customer's own metadata.
 */
async function resolveUserId(subscription: Stripe.Subscription): Promise<string | null> {
  const fromMetadata = subscription.metadata?.userId
  if (fromMetadata) return fromMetadata

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id

  const [row] = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .where(eq(schema.user.stripeCustomerId, customerId))
    .limit(1)

  if (row) return row.id

  const customer = await stripe().customers.retrieve(customerId)
  if (!customer.deleted && customer.metadata?.userId) {
    return customer.metadata.userId
  }

  return null
}
