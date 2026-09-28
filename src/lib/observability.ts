/**
 * One decision about error reporting, made in one place.
 *
 * Everything Sentry-related is inert until `NEXT_PUBLIC_SENTRY_DSN` is set, so
 * the code can ship before the account exists and start reporting the moment a
 * DSN lands in the environment — no redeploy of different code, just a restart.
 *
 * The DSN is public by design: it identifies a project to send to and grants
 * nothing. It has to reach the browser, which is why it carries the
 * NEXT_PUBLIC_ prefix, and it is baked in at build time like any other.
 */

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN ?? ""

export const errorReportingEnabled = SENTRY_DSN.length > 0

/**
 * Where the browser SDK sends events, for the CSP to allow.
 *
 * Derived from the DSN rather than hard-coded, because a self-hosted Sentry or
 * an EU-region project is a different host, and getting this wrong fails
 * silently — the browser blocks the request and no error ever arrives.
 */
export function sentryIngestOrigin(): string | null {
  if (!SENTRY_DSN) return null
  try {
    return new URL(SENTRY_DSN).origin
  } catch {
    return null
  }
}
