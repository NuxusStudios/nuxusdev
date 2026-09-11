import { NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { env } from "@/server/env"
import { requireUser } from "@/server/session"
import { isPlanId } from "@/lib/plans"

/**
 * Development-only stand-in for the billing webhook: grants the signed-in user
 * a plan so the paywall can be exercised without a payment provider.
 *
 * Returns 404 in production — the route may as well not exist there. When
 * billing is wired up, the provider's webhook writes the same rows.
 */
export async function POST(request: Request) {
  if (env.isProduction) {
    return new NextResponse("Not found", { status: 404 })
  }

  const user = await requireUser().catch(() => null)
  if (!user) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { plan?: string }
  const plan = body.plan ?? "builder"

  if (!isPlanId(plan)) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 })
  }

  await db
    .update(schema.subscription)
    .set({ status: "canceled", updatedAt: new Date() })
    .where(eq(schema.subscription.userId, user.id))

  if (plan !== "free") {
    await db.insert(schema.subscription).values({
      id: randomUUID(),
      userId: user.id,
      plan,
      status: "active",
      currentPeriodEnd: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
      provider: "dev",
    })
  }

  return NextResponse.json({ ok: true, plan, email: user.email })
}
