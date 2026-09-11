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
