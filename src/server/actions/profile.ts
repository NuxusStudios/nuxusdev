"use server"

import { and, eq, ne } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db, schema } from "@/server/db"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"

/** Handles that would collide with a route or look official. */
const RESERVED = new Set([
  "admin", "api", "auth", "billing", "blog", "community", "components", "contact",
  "dashboard", "docs", "help", "icons", "library", "login", "logout", "new", "nuxus",
  "preview", "pricing", "privacy", "publish", "r", "root", "settings", "signin",
  "signup", "sign-in", "sign-up", "staff", "support", "system", "team", "templates",
  "terms", "themes", "user", "users",
])

const profileSchema = z.object({
  name: z.string().trim().min(1, "Name can't be empty").max(80),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Handle must be at least 3 characters")
    .max(24, "Handle must be 24 characters or fewer")
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "Use letters, numbers and hyphens"),
  bio: z.string().trim().max(280, "Keep your bio under 280 characters").optional(),
  website: z
    .union([z.string().trim().max(120), z.literal("")])
    .optional()
    .transform((value) => value || undefined),
  location: z.string().trim().max(120).optional(),
  twitterUsername: z
    .string()
    .trim()
    .max(40)
    .regex(/^[A-Za-z0-9_]*$/, "That doesn't look like an X handle")
    .optional(),
})

export type ProfileInput = z.input<typeof profileSchema>

export async function updateProfile(input: ProfileInput) {
  return run(async () => {
    const user = await requireUser()
    enforceRateLimit(`profile:${user.id}`, { max: 30, windowSeconds: 600 })

    const parsed = profileSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0].message)
    const data = parsed.data

    if (RESERVED.has(data.handle)) {
      throw new ValidationError("That handle is reserved")
    }

    // handles are public URLs, so they must stay unique
    const [clash] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(and(eq(schema.user.handle, data.handle), ne(schema.user.id, user.id)))
      .limit(1)

    if (clash) throw new ValidationError("That handle is already taken")

    await db
      .update(schema.user)
      .set({
        name: data.name,
        handle: data.handle,
        bio: data.bio ?? null,
        website: data.website ?? null,
        location: data.location ?? null,
        twitterUsername: data.twitterUsername || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, user.id))

    revalidatePath(`/@${data.handle}`)
    revalidatePath("/settings")

    return { handle: data.handle }
  })
}

/** Everything the settings page needs, read fresh rather than from the session cache. */
export async function readProfile() {
  const user = await requireUser()

  const [row] = await db
    .select({
      name: schema.user.name,
      email: schema.user.email,
      emailVerified: schema.user.emailVerified,
      image: schema.user.image,
      handle: schema.user.handle,
      bio: schema.user.bio,
      website: schema.user.website,
      location: schema.user.location,
      twitterUsername: schema.user.twitterUsername,
      createdAt: schema.user.createdAt,
    })
    .from(schema.user)
    .where(eq(schema.user.id, user.id))
    .limit(1)

  return row ?? null
}

/** Whether this account can change its password — OAuth-only users cannot. */
export async function hasPassword() {
  const user = await requireUser()
  const [row] = await db
    .select({ id: schema.account.id })
    .from(schema.account)
    .where(and(eq(schema.account.userId, user.id), eq(schema.account.providerId, "credential")))
    .limit(1)
  return Boolean(row)
}
