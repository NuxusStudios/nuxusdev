import "server-only"
import { createHash, randomBytes } from "node:crypto"
import { and, desc, eq, inArray, ne, or } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { isPlanId, type PlanId } from "@/lib/plans"

/**
 * Team seats.
 *
 * A Team subscription is billed per seat, so the seats have to be usable: the
 * owner invites people, and an accepted invite grants that user the owner's
 * plan for as long as the subscription stays active. Everything is derived
 * from the subscription — revoke it, cancel it or let it lapse, and every seat
 * on it loses access at the same moment.
 */

const INVITE_TTL_DAYS = 14
const ACTIVE_STATUSES = ["active", "trialing"] as const

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex")
}

/** True for the plans that are sold per seat. */
export function isTeamPlan(plan: string): boolean {
  return plan.startsWith("team")
}

export interface OwnedTeam {
  subscriptionId: string
  plan: PlanId
  seats: number
  aiCredits: number
  currentPeriodEnd: Date | null
}

/** The team subscription this user owns and pays for, if any. */
export async function getOwnedTeam(userId: string): Promise<OwnedTeam | null> {
  const [row] = await db
    .select({
      id: schema.subscription.id,
      plan: schema.subscription.plan,
      seats: schema.subscription.seats,
      aiCredits: schema.subscription.aiCredits,
      periodEnd: schema.subscription.currentPeriodEnd,
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

  if (!row || !isTeamPlan(row.plan) || !isPlanId(row.plan)) return null
  if (row.periodEnd && row.periodEnd.getTime() < Date.now()) return null

  return {
    subscriptionId: row.id,
    plan: row.plan,
    seats: row.seats,
    aiCredits: row.aiCredits,
    currentPeriodEnd: row.periodEnd,
  }
}

export interface Seat {
  id: string
  email: string
  status: string
  /** name of the user who accepted, when someone has */
  memberName: string | null
  memberEmail: string | null
  acceptedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
}

export async function listSeats(subscriptionId: string): Promise<Seat[]> {
  const rows = await db
    .select({
      id: schema.teamMember.id,
      email: schema.teamMember.email,
      status: schema.teamMember.status,
      acceptedAt: schema.teamMember.acceptedAt,
      expiresAt: schema.teamMember.expiresAt,
      createdAt: schema.teamMember.createdAt,
      memberName: schema.user.name,
      memberEmail: schema.user.email,
    })
    .from(schema.teamMember)
    .leftJoin(schema.user, eq(schema.user.id, schema.teamMember.userId))
    .where(
      and(
        eq(schema.teamMember.subscriptionId, subscriptionId),
        ne(schema.teamMember.status, "revoked")
      )
    )
    .orderBy(desc(schema.teamMember.createdAt))

  return rows
}

/** Seats in use, counting the owner's own seat. */
export function seatsUsed(seats: Seat[]): number {
  return seats.filter((seat) => seat.status !== "revoked").length + 1
}

export interface Invite {
  id: string
  email: string
  /** the raw token — only returned here, never stored */
  token: string
}

export async function createInvite(
  team: OwnedTeam,
  ownerId: string,
  email: string
): Promise<Invite> {
  const token = randomBytes(24).toString("base64url")
  const id = crypto.randomUUID()

  await db.insert(schema.teamMember).values({
    id,
    subscriptionId: team.subscriptionId,
    ownerId,
    email: email.toLowerCase(),
    inviteHash: hash(token),
    status: "pending",
    expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000),
  })

  return { id, email, token }
}

export interface InvitePreview {
  id: string
  email: string
  ownerName: string | null
  plan: PlanId
  /** null when the invite is usable */
  problem: "expired" | "revoked" | "taken" | "subscription_inactive" | null
}

/** Resolves an invite token for display, without consuming it. */
export async function previewInvite(token: string): Promise<InvitePreview | null> {
  const [row] = await db
    .select({
      id: schema.teamMember.id,
      email: schema.teamMember.email,
      status: schema.teamMember.status,
      expiresAt: schema.teamMember.expiresAt,
      ownerName: schema.user.name,
      plan: schema.subscription.plan,
      subStatus: schema.subscription.status,
      periodEnd: schema.subscription.currentPeriodEnd,
    })
    .from(schema.teamMember)
    .innerJoin(schema.user, eq(schema.user.id, schema.teamMember.ownerId))
    .innerJoin(schema.subscription, eq(schema.subscription.id, schema.teamMember.subscriptionId))
    .where(eq(schema.teamMember.inviteHash, hash(token)))
    .limit(1)

  if (!row) return null

  const plan = isPlanId(row.plan) ? row.plan : "free"
  const base = { id: row.id, email: row.email, ownerName: row.ownerName, plan }

  if (row.status === "revoked") return { ...base, problem: "revoked" }
  if (row.status === "active") return { ...base, problem: "taken" }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ...base, problem: "expired" }
  }
  if (
    !ACTIVE_STATUSES.includes(row.subStatus as (typeof ACTIVE_STATUSES)[number]) ||
    (row.periodEnd && row.periodEnd.getTime() < Date.now())
  ) {
    return { ...base, problem: "subscription_inactive" }
  }

  return { ...base, problem: null }
}

export type AcceptResult =
  | { ok: true; plan: PlanId }
  | { ok: false; reason: "not_found" | "expired" | "revoked" | "taken" | "subscription_inactive" | "own_team" }

export async function acceptInvite(token: string, userId: string): Promise<AcceptResult> {
  const preview = await previewInvite(token)
  if (!preview) return { ok: false, reason: "not_found" }
  if (preview.problem) return { ok: false, reason: preview.problem }

  const [seat] = await db
    .select({ ownerId: schema.teamMember.ownerId })
    .from(schema.teamMember)
    .where(eq(schema.teamMember.id, preview.id))
    .limit(1)

  if (seat?.ownerId === userId) return { ok: false, reason: "own_team" }

  // claim the seat only while it is still pending, so two people opening the
  // same link cannot both take it
  await db
    .update(schema.teamMember)
    .set({ userId, status: "active", acceptedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.teamMember.id, preview.id), eq(schema.teamMember.status, "pending")))

  const [confirmed] = await db
    .select({ userId: schema.teamMember.userId })
    .from(schema.teamMember)
    .where(eq(schema.teamMember.id, preview.id))
    .limit(1)

  if (confirmed?.userId !== userId) return { ok: false, reason: "taken" }

  return { ok: true, plan: preview.plan }
}

export async function revokeSeat(subscriptionId: string, seatId: string): Promise<void> {
  await db
    .update(schema.teamMember)
    .set({ status: "revoked", revokedAt: new Date(), updatedAt: new Date() })
    .where(
      and(
        eq(schema.teamMember.id, seatId),
        eq(schema.teamMember.subscriptionId, subscriptionId)
      )
    )
}

/**
 * The plan this user holds through someone else's team, if any.
 *
 * Read on every entitlement check, so it stays a single indexed query.
 */
export async function planFromTeamSeat(
  userId: string
): Promise<{ plan: PlanId; aiCredits: number } | null> {
  const [row] = await db
    .select({
      plan: schema.subscription.plan,
      aiCredits: schema.subscription.aiCredits,
      status: schema.subscription.status,
      periodEnd: schema.subscription.currentPeriodEnd,
    })
    .from(schema.teamMember)
    .innerJoin(schema.subscription, eq(schema.subscription.id, schema.teamMember.subscriptionId))
    .where(and(eq(schema.teamMember.userId, userId), eq(schema.teamMember.status, "active")))
    .orderBy(desc(schema.teamMember.acceptedAt))
    .limit(1)

  if (!row || !isPlanId(row.plan)) return null
  if (!ACTIVE_STATUSES.includes(row.status as (typeof ACTIVE_STATUSES)[number])) return null
  if (row.periodEnd && row.periodEnd.getTime() < Date.now()) return null

  return { plan: row.plan, aiCredits: row.aiCredits ?? 0 }
}

/** Guards against inviting the same address onto the same team twice. */
export async function hasSeatFor(subscriptionId: string, email: string): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.teamMember.id })
    .from(schema.teamMember)
    .leftJoin(schema.user, eq(schema.user.id, schema.teamMember.userId))
    .where(
      and(
        eq(schema.teamMember.subscriptionId, subscriptionId),
        ne(schema.teamMember.status, "revoked"),
        or(
          eq(schema.teamMember.email, email.toLowerCase()),
          eq(schema.user.email, email.toLowerCase())
        )
      )
    )
    .limit(1)

  return Boolean(row)
}
