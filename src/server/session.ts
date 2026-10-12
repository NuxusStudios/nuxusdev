import "server-only"
import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "@/server/auth"

/**
 * Reads the session from the database, deduped per request.
 *
 * Always use this on the server — the middleware only checks that a cookie
 * exists, which proves nothing about whether the session is still valid.
 */
export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null
  if (session.user.banned) return null
  return session
})

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

export class UnauthorizedError extends Error {
  constructor() {
    super("You need to be signed in to do that.")
    this.name = "UnauthorizedError"
  }
}

/** Throws rather than returning null — for mutations that require an account. */
export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new UnauthorizedError()
  return user
}

export class ForbiddenError extends Error {
  constructor() {
    super("You don't have access to that.")
    this.name = "ForbiddenError"
  }
}

/**
 * For the review queue and anything else only the Nuxus team may touch.
 *
 * The role lives on the user row and is never settable through the API —
 * `role` is declared with `input: false` in the auth config, so no sign-up or
 * profile update can grant it. It is changed in the database, deliberately, by
 * someone with database access.
 *
 * Throws `ForbiddenError` rather than returning false, so a caller that forgets
 * to check the result still fails closed.
 */
export async function requireAdmin() {
  const user = await requireUser()
  if ((user as { role?: string }).role !== "admin") throw new ForbiddenError()
  return user
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return (user as { role?: string } | null)?.role === "admin"
}
