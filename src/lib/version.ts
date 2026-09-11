import { createHash } from "node:crypto"

/**
 * A short, stable identifier for a component's current content.
 *
 * Formatting-insensitive on purpose: trailing whitespace and line endings
 * shouldn't make a component look changed when it isn't. Anything that would
 * alter behaviour still changes the hash.
 */
export function contentVersion(...parts: (string | null | undefined)[]): string {
  const normalised = parts
    .map((part) => (part ?? "").replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim())
    .join("\n--\n")

  return createHash("sha256").update(normalised).digest("hex").slice(0, 12)
}
