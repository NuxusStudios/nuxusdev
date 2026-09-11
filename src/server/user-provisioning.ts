import "server-only"
import { eq, sql } from "drizzle-orm"
import { db, schema } from "@/server/db"

/** URL-safe handle derived from a display name or email local-part. */
function baseHandle(email: string, name?: string | null): string {
  const source = (name?.trim() || email.split("@")[0] || "user").toLowerCase()
  const slug = source
    .normalize("NFKD")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24)
  return slug.length >= 3 ? slug : `user-${slug}`.slice(0, 24)
}

/** Handles that would collide with a route or look official. */
const RESERVED = new Set([
  "admin", "administrator", "api", "auth", "blog", "community", "components",
  "contact", "dashboard", "docs", "help", "icons", "library", "login", "logout",
  "new", "nuxus", "preview", "pricing", "privacy", "publish", "r", "root",
  "settings", "signin", "signup", "sign-in", "sign-up", "staff", "support",
  "system", "team", "templates", "terms", "themes", "user", "users",
])

async function uniqueHandle(email: string, name?: string | null): Promise<string> {
  const base = baseHandle(email, name)
  let candidate = RESERVED.has(base) ? `${base}-1` : base

  for (let attempt = 0; attempt < 25; attempt++) {
    const [existing] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where(eq(schema.user.handle, candidate))
      .limit(1)

    if (!existing) return candidate
    candidate = `${base}-${Math.floor(Math.random() * 9000) + 1000}`
  }

  // give up on pretty and guarantee uniqueness
  return `${base}-${crypto.randomUUID().slice(0, 8)}`
}

/**
 * Chooses the public @handle before the user row is written, so it is present
 * in the very first session rather than appearing a cache-cycle later.
 */
export async function assignHandle(email: string, name?: string | null): Promise<string> {
  return uniqueHandle(email, name)
}

/**
 * Runs right after the user row exists: gives them a default collection so the
 * bookmark button always has somewhere to put things.
 */
export async function onUserCreated(userId: string): Promise<void> {
  try {
    await db
      .insert(schema.collection)
      .values({
        id: crypto.randomUUID(),
        userId,
        name: "Saved",
        slug: "saved",
        isDefault: true,
      })
      // MySQL has no DO NOTHING; setting a key column to itself is the no-op
      .onDuplicateKeyUpdate({ set: { slug: sql`slug` } })
  } catch (error) {
    // never block sign-up on provisioning — repaired lazily on first use
    console.error("user provisioning failed", { userId, error })
  }
}

/** Repairs a user that slipped through without a handle or default list. */
export async function ensureProvisioned(userId: string, email: string, name?: string | null) {
  const [row] = await db
    .select({ handle: schema.user.handle })
    .from(schema.user)
    .where(eq(schema.user.id, userId))
    .limit(1)

  if (row && !row.handle) {
    await db
      .update(schema.user)
      .set({ handle: await uniqueHandle(email, name) })
      .where(eq(schema.user.id, userId))
  }

  await onUserCreated(userId)
}
