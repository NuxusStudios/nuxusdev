/**
 * Password policy shared by the sign-up form and the server.
 *
 * Deliberately NIST-style: length is the requirement, not a composition rule
 * (no "must contain a symbol"), plus a blocklist of the passwords that actually
 * show up in credential-stuffing lists. The client uses this for live feedback;
 * src/server/password.ts enforces the same rules before hashing, which is the
 * check that actually counts.
 */

const MIN_LENGTH = 12
const MAX_LENGTH = 200

/** The head of every breach list, normalised to lower case. */
const BLOCKLIST = new Set([
  "password", "password1", "password123", "password1234", "passw0rd",
  "123456", "1234567", "12345678", "123456789", "1234567890", "12345678910",
  "qwerty", "qwertyuiop", "qwerty123", "qwerty1234", "1q2w3e4r", "1qaz2wsx",
  "letmein", "letmein123", "welcome", "welcome1", "welcome123", "admin",
  "administrator", "iloveyou", "sunshine", "princess", "football", "baseball",
  "monkey", "dragon", "master", "shadow", "superman", "batman", "trustno1",
  "abc123", "abcd1234", "abcdefgh", "asdfghjkl", "zxcvbnm", "000000", "111111",
  "121212", "123123", "654321", "666666", "696969", "888888", "987654321",
  "changeme", "changeme123", "secret", "starwars", "whatever", "computer",
  "michael", "jennifer", "jordan23", "hunter2", "freedom", "ninja", "azerty",
  "passwordpassword", "loveyou", "lovely", "charlie", "donald", "photoshop",
  "nuxus", "nuxus123", "nuxuspassword",
])

/** obvious keyboard runs and repeats, checked after stripping digits/case */
function isLowEntropy(password: string): boolean {
  const lower = password.toLowerCase()

  // a single repeated character — "aaaaaaaaaaaa"
  if (/^(.)\1+$/.test(lower)) return true

  // a short unit repeated to length — "abcabcabcabc"
  for (let unit = 1; unit <= 4; unit++) {
    const head = lower.slice(0, unit)
    if (head.repeat(Math.ceil(lower.length / unit)).slice(0, lower.length) === lower) {
      return true
    }
  }

  // strictly ascending or descending character runs — "abcdefghijkl", "9876543210"
  let ascending = true
  let descending = true
  for (let i = 1; i < lower.length; i++) {
    const delta = lower.charCodeAt(i) - lower.charCodeAt(i - 1)
    if (delta !== 1) ascending = false
    if (delta !== -1) descending = false
  }
  if (ascending || descending) return true

  // fewer than five distinct characters over a long string
  if (new Set(lower).size < 5) return true

  return false
}

export interface PasswordProblem {
  code: "too_short" | "too_long" | "blocked" | "low_entropy" | "contains_identifier"
  message: string
}

/** Pure check — used by both the server enforcement and the client meter. */
export function checkPassword(
  password: string,
  identifiers: string[] = []
): PasswordProblem | null {
  if (password.length < MIN_LENGTH) {
    return { code: "too_short", message: `Use at least ${MIN_LENGTH} characters.` }
  }
  if (password.length > MAX_LENGTH) {
    return { code: "too_long", message: `Keep it under ${MAX_LENGTH} characters.` }
  }

  const lower = password.toLowerCase()

  if (BLOCKLIST.has(lower)) {
    return { code: "blocked", message: "That password appears in known breach lists." }
  }

  // a blocked password with a couple of characters bolted on is still blocked
  for (const blocked of BLOCKLIST) {
    if (blocked.length >= 6 && lower.includes(blocked)) {
      return { code: "blocked", message: "That password is too close to a commonly used one." }
    }
  }

  if (isLowEntropy(password)) {
    return { code: "low_entropy", message: "That password is too predictable." }
  }

  for (const identifier of identifiers) {
    const part = identifier.split("@")[0]?.toLowerCase()
    if (part && part.length >= 4 && lower.includes(part)) {
      return {
        code: "contains_identifier",
        message: "Don't include your name or email address in the password.",
      }
    }
  }

  return null
}

export const PASSWORD_MIN_LENGTH = MIN_LENGTH
