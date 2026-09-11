import "server-only"
import { createHash, randomBytes } from "node:crypto"
import { and, desc, eq, isNull } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { PLANS, isPlanId, type Plan } from "@/lib/plans"
import { planFromTeamSeat } from "@/server/teams"

/**
 * Personal access tokens for the CLI and MCP server.
 *
 * Browser requests carry a session cookie; a terminal cannot. These tokens are
 * the machine equivalent, and they resolve to the same plan check — so the CLI
 * cannot be used to sidestep the paywall.
 */

const PREFIX = "nxs_"

function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

export interface IssuedToken {
  id: string
  name: string
  /** shown once, at creation — never retrievable afterwards */
  token: string
  prefix: string
}

export async function createToken(userId: string, name: string): Promise<IssuedToken> {
  const secret = randomBytes(24).toString("base64url")
  const token = `${PREFIX}${secret}`
  const id = crypto.randomUUID()

  await db.insert(schema.apiToken).values({
    id,
    userId,
    name: name.trim().slice(0, 80) || "CLI token",
    tokenHash: hash(token),
    prefix: token.slice(0, 12),
  })

  return { id, name, token, prefix: token.slice(0, 12) }
}

export interface TokenBearer {
  userId: string
  tokenId: string
  plan: Plan
  canCopy: boolean
}

/**
 * Resolves a raw token to its owner and plan, or null.
 *
 * Looks the token up by hash, so a timing attack reveals nothing beyond
 * existence, and rejects revoked or expired tokens.
 */
export async function verifyToken(raw: string | null | undefined): Promise<TokenBearer | null> {
  if (!raw) return null

  const token = raw.trim()
  if (!token.startsWith(PREFIX) || token.length < 20) return null

  const [row] = await db
    .select({
      id: schema.apiToken.id,
      userId: schema.apiToken.userId,
      expiresAt: schema.apiToken.expiresAt,
      revokedAt: schema.apiToken.revokedAt,
      banned: schema.user.banned,
    })
    .from(schema.apiToken)
    .innerJoin(schema.user, eq(schema.user.id, schema.apiToken.userId))
    .where(eq(schema.apiToken.tokenHash, hash(token)))
    .limit(1)

  if (!row || row.revokedAt || row.banned) return null
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null

  // the plan is read fresh; a cancelled subscription takes effect immediately
  const [subscription] = await db
    .select({
      plan: schema.subscription.plan,
      periodEnd: schema.subscription.currentPeriodEnd,
    })
    .from(schema.subscription)
    .where(
      and(eq(schema.subscription.userId, row.userId), eq(schema.subscription.status, "active"))
    )
    .orderBy(desc(schema.subscription.createdAt))
    .limit(1)

  const expired = subscription?.periodEnd && subscription.periodEnd.getTime() < Date.now()
  const ownPlan =
    !subscription || expired || !isPlanId(subscription.plan) ? null : subscription.plan

  // falling back to a team seat keeps the CLI and MCP in step with the website
  const planId = ownPlan ?? (await planFromTeamSeat(row.userId))?.plan ?? "free"
  const plan = PLANS[planId]

  // best-effort; a failed touch must never block a valid request
  void db
    .update(schema.apiToken)
    .set({ lastUsedAt: new Date() })
    .where(eq(schema.apiToken.id, row.id))
    .catch(() => {})

  return { userId: row.userId, tokenId: row.id, plan, canCopy: plan.canCopy }
}

/** Pulls a token from an Authorization header or a `token` query parameter. */
export function tokenFromRequest(request: Request): string | null {
  const header = request.headers.get("authorization")
  if (header?.toLowerCase().startsWith("bearer ")) return header.slice(7).trim()

  const url = new URL(request.url)
  return url.searchParams.get("token")
}

export async function listTokens(userId: string) {
  return db
    .select({
      id: schema.apiToken.id,
      name: schema.apiToken.name,
      prefix: schema.apiToken.prefix,
      lastUsedAt: schema.apiToken.lastUsedAt,
      createdAt: schema.apiToken.createdAt,
    })
    .from(schema.apiToken)
    .where(and(eq(schema.apiToken.userId, userId), isNull(schema.apiToken.revokedAt)))
    .orderBy(desc(schema.apiToken.createdAt))
}

export async function revokeToken(userId: string, tokenId: string): Promise<boolean> {
  await db
    .update(schema.apiToken)
    .set({ revokedAt: new Date() })
    .where(and(eq(schema.apiToken.id, tokenId), eq(schema.apiToken.userId, userId)))
  return true
}
