"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import {
  acceptInvite,
  createInvite,
  getOwnedTeam,
  hasSeatFor,
  listSeats,
  revokeSeat,
  seatsUsed,
  type Seat,
} from "@/server/teams"
import { BRAND } from "@/lib/brand"

const emailSchema = z.string().trim().toLowerCase().email("That doesn't look like an email address")

export interface SeatSummary {
  id: string
  email: string
  status: string
  memberName: string | null
  memberEmail: string | null
  acceptedAt: string | null
  expiresAt: string | null
}

export interface TeamView {
  seats: SeatSummary[]
  totalSeats: number
  used: number
}

function toSummary(seat: Seat): SeatSummary {
  return {
    id: seat.id,
    email: seat.email,
    status: seat.status,
    memberName: seat.memberName,
    memberEmail: seat.memberEmail,
    acceptedAt: seat.acceptedAt?.toISOString() ?? null,
    expiresAt: seat.expiresAt?.toISOString() ?? null,
  }
}

/** Null when the caller doesn't own a team subscription. */
export async function getTeam() {
  return run(async (): Promise<TeamView | null> => {
    const user = await requireUser()
    const team = await getOwnedTeam(user.id)
    if (!team) return null

    const seats = await listSeats(team.subscriptionId)
    return {
      seats: seats.map(toSummary),
      totalSeats: team.seats,
      used: seatsUsed(seats),
    }
  })
}

export async function inviteMember(email: string) {
  return run(async () => {
    const user = await requireUser()
    enforceRateLimit(`team:invite:${user.id}`, { max: 30, windowSeconds: 3600 })

    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0].message)

    const team = await getOwnedTeam(user.id)
    if (!team) throw new ValidationError("You don't have an active team plan.")

    if (parsed.data === user.email.toLowerCase()) {
      throw new ValidationError("You already hold a seat as the owner.")
    }

    const seats = await listSeats(team.subscriptionId)
    if (seatsUsed(seats) >= team.seats) {
      throw new ValidationError(
        `All ${team.seats} seats are in use. Add seats from the billing portal, or revoke one first.`
      )
    }

    if (await hasSeatFor(team.subscriptionId, parsed.data)) {
      throw new ValidationError(`${parsed.data} already has a seat on this team.`)
    }

    const invite = await createInvite(team, user.id, parsed.data)
    revalidatePath("/team")

    // email delivery is optional, so the link is always returned for the owner
    // to pass on however they like
    return {
      email: invite.email,
      url: `https://${BRAND.domain}/team/join/${invite.token}`,
    }
  })
}

export async function removeMember(seatId: string) {
  return run(async () => {
    const user = await requireUser()
    const team = await getOwnedTeam(user.id)
    if (!team) throw new ValidationError("You don't have an active team plan.")

    await revokeSeat(team.subscriptionId, seatId)
    revalidatePath("/team")
  })
}

export async function joinTeam(token: string) {
  return run(async () => {
    const user = await requireUser()
    enforceRateLimit(`team:join:${user.id}`, { max: 20, windowSeconds: 3600 })

    const result = await acceptInvite(token, user.id)

    if (!result.ok) {
      const message: Record<typeof result.reason, string> = {
        not_found: "That invite link isn't valid.",
        expired: "That invite has expired. Ask for a new one.",
        revoked: "That invite was revoked.",
        taken: "That seat has already been claimed.",
        subscription_inactive: "The team's plan is no longer active.",
        own_team: "That's your own team — you already have access.",
      }
      throw new ValidationError(message[result.reason])
    }

    revalidatePath("/", "layout")
    return { plan: result.plan }
  })
}
