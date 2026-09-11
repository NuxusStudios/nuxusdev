import "server-only"
import { and, eq, gte, sql } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { getEntitlements } from "@/server/entitlements"

/**
 * Monthly AI credits.
 *
 * The allowance comes from the plan; consumption comes from a ledger. Balance
 * is the allowance minus everything spent since the period began, so there is
 * no stored counter to drift out of step with reality, and a failed
 * generation can be refunded by writing the opposite row.
 */

export class OutOfCreditsError extends Error {
  constructor(public readonly balance: number) {
    super("Not enough AI credits left this month.")
    this.name = "OutOfCreditsError"
  }
}

/** Credits reset on the first of the month, in UTC. */
function periodStart(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

export interface CreditBalance {
  /** the plan's monthly allowance */
  allowance: number
  /** used since the period began */
  used: number
  remaining: number
  /** when the allowance resets */
  renewsAt: Date
}

export async function getBalance(userId: string, allowance?: number): Promise<CreditBalance> {
  const monthly = allowance ?? (await getEntitlements()).aiCredits
  const start = periodStart()

  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${schema.creditLedger.delta}), 0)` })
    .from(schema.creditLedger)
    .where(
      and(eq(schema.creditLedger.userId, userId), gte(schema.creditLedger.createdAt, start))
    )

  // ledger deltas are negative for spends, so a negative sum is usage
  const used = Math.max(0, -Number(row?.total ?? 0))
  const renewsAt = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1))

  return { allowance: monthly, used, remaining: Math.max(0, monthly - used), renewsAt }
}

/**
 * Takes credits before the work happens.
 *
 * Charging first means a request that fails or times out cannot be retried for
 * free in a loop; the caller refunds on failure instead. The balance is
 * re-read inside the same call rather than trusted from the UI.
 */
export async function spend(
  userId: string,
  amount: number,
  reason: string,
  options: { allowance?: number; note?: string } = {}
): Promise<string> {
  // the allowance is passed in rather than read from the ambient request, so
  // this works from a script, a job or a webhook and not only inside a render
  const balance = await getBalance(userId, options.allowance)
  if (balance.remaining < amount) throw new OutOfCreditsError(balance.remaining)

  const id = crypto.randomUUID()
  await db.insert(schema.creditLedger).values({
    id,
    userId,
    delta: -Math.abs(amount),
    reason,
    note: options.note?.slice(0, 200),
  })

  return id
}

/** Writes the opposite row when the work the credits paid for didn't happen. */
export async function refund(userId: string, amount: number, reason: string): Promise<void> {
  await db.insert(schema.creditLedger).values({
    id: crypto.randomUUID(),
    userId,
    delta: Math.abs(amount),
    reason: `refund:${reason}`.slice(0, 40),
    note: "automatic refund after a failed generation",
  })
}
