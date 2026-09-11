"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import { createToken, listTokens, revokeToken } from "@/server/tokens"

/** A generous ceiling — enough for several machines, low enough to bound abuse. */
const MAX_TOKENS = 10

const nameSchema = z
  .string()
  .trim()
  .min(1, "Give the token a name so you can recognise it later")
  .max(80, "Keep the name under 80 characters")

export interface TokenSummary {
  id: string
  name: string
  prefix: string
  lastUsedAt: string | null
  createdAt: string
}

export async function getTokens() {
  return run(async () => {
    const user = await requireUser()
    const rows = await listTokens(user.id)
    return rows.map(
      (row): TokenSummary => ({
        id: row.id,
        name: row.name,
        prefix: row.prefix,
        lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
        createdAt: row.createdAt.toISOString(),
      })
    )
  })
}

/** The only moment the raw token exists outside the user's machine. */
export async function issueToken(name: string) {
  return run(async () => {
    const user = await requireUser()
    enforceRateLimit(`token:create:${user.id}`, { max: 10, windowSeconds: 3600 })

    const parsed = nameSchema.safeParse(name)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0].message)

    const existing = await listTokens(user.id)
    if (existing.length >= MAX_TOKENS) {
      throw new ValidationError(
        `You already have ${MAX_TOKENS} active tokens. Revoke one before creating another.`
      )
    }

    const issued = await createToken(user.id, parsed.data)
    revalidatePath("/settings")
    return issued
  })
}

export async function deleteToken(tokenId: string) {
  return run(async () => {
    const user = await requireUser()
    await revokeToken(user.id, tokenId)
    revalidatePath("/settings")
  })
}
