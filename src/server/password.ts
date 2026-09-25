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

/**
 * Refuses a new password that is the one already on the account.
 *
 * This cannot live in `hashPassword` like the rest of the policy: the hasher is
 * handed a password and nothing else, so it has no idea whose it is, and scrypt
 * salts every hash — two hashes of the same password never match, so the only
 * way to answer the question is to verify the plaintext against the stored
 * hash. That needs the account, which only the request has.
 *
 * Silent when there is no stored hash: an account that has only ever signed in
 * with GitHub or a magic link has no password to repeat.
 */
export async function assertPasswordIsNew(
  currentHash: string | null | undefined,
  candidate: string,
): Promise<void> {
  if (!currentHash) return
  if (await verifyScrypt({ hash: currentHash, password: candidate })) {
    throw new APIError("BAD_REQUEST", {
      message: "That is already your password. Choose a different one.",
      code: "PASSWORD_UNCHANGED",
    })
  }
}

export { checkPassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy"
