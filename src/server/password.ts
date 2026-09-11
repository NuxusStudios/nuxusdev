import "server-only"
import { APIError } from "better-auth/api"
import { hashPassword as hashWithScrypt, verifyPassword as verifyScrypt } from "better-auth/crypto"
import { checkPassword } from "@/lib/password-policy"

/**
 * Server-side enforcement of the shared password policy.
 *
 * The hashing itself is delegated to Better Auth's scrypt — this module only
 * decides what is allowed, and does so on the path every password must take.
 */

/**
 * Wraps the scrypt hasher so a weak password can never reach the database.
 * Runs on sign-up and on every password change.
 */
export async function hashPassword(password: string): Promise<string> {
  assertPasswordAcceptable(password)
  return hashWithScrypt(password)
}

export async function verifyPassword(data: { hash: string; password: string }): Promise<boolean> {
  return verifyScrypt(data)
}

export function assertPasswordAcceptable(password: string, identifiers: string[] = []): void {
  const problem = checkPassword(password, identifiers)
  if (problem) {
    throw new APIError("BAD_REQUEST", { message: problem.message, code: problem.code })
  }
}

export { checkPassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy"
