import * as Sentry from "@sentry/nextjs"
import { SENTRY_DSN, errorReportingEnabled } from "@/lib/observability"

/**
 * Runs once when the server process starts.
 *
 * Hostinger launches Next directly rather than through `npm start`, so a
 * `prestart` script never fires there. This hook is part of the framework and
 * runs wherever the app runs, which makes it the reliable place to bring the
 * database schema up to date on deploy.
 *
 * The work lives in a separate module loaded dynamically, so the Node built-ins
 * it needs are never compiled for the Edge runtime.
 *
 * Error reporting is started here too. It has to be: a project using `src/` has
 * exactly one instrumentation file and Next ignores any at the repository root,
 * so a second one there starts nothing and says nothing about it.
 */
export async function register() {
  // Before the nodejs guard: the edge runtime raises errors worth seeing too,
  // and this is the only hook that runs there.
  if (errorReportingEnabled) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      // Sentry 11 sends no PII by default, but "by default" is not a guarantee
      // worth resting on here: a stack frame on this site can carry a password
      // reset token, a session cookie or a Stripe key. Strip the request
      // envelope explicitly.
      beforeSend(event) {
        if (event.request) {
          delete event.request.cookies
          delete event.request.headers
          delete event.request.data
        }
        delete event.user
        return event
      },
    })
  }

  if (process.env.NEXT_RUNTIME !== "nodejs") return

  // `next build` imports this file but must never touch a real database
  if (process.env.NEXT_PHASE === "phase-production-build") return

  try {
    // says what is configured in the one place that can see the real
    // environment — a shell on the host cannot
    const { reportConfig } = await import("@/server/report-config")
    reportConfig()
  } catch {
    // a diagnostic must never be the reason a deploy fails
  }

  try {
    const { migrateOnBoot } = await import("@/server/migrate-on-boot")
    await migrateOnBoot()
  } catch (error) {
    // Logged rather than thrown: most of this site is public content that reads
    // no database, and serving it beats a blank domain while this is fixed.
    console.error(
      "[startup] migrations failed — sign-in and bookmarks will not work:",
      error instanceof Error ? error.message : error
    )
  }
}

export const onRequestError = Sentry.captureRequestError
