import * as Sentry from "@sentry/nextjs"
import { SENTRY_DSN, errorReportingEnabled } from "@/lib/observability"

/**
 * Browser error reporting.
 *
 * Only useful if the CSP lets it out — `connect-src` has to name the ingest
 * host, which `proxy.ts` derives from this same DSN. Without that the SDK runs,
 * catches everything, and every report is blocked with nothing in the logs to
 * say so.
 */
/**
 * A flag saying whether monitoring is genuinely on, readable from the console.
 *
 * Kept deliberately. This file silently did nothing for two deploys — the CSP
 * named the ingest host, the SDK bundle loaded, and from outside everything
 * looked configured while no client was ever bound. There was no way to tell
 * without picking through Sentry's internals. `__NUXUS_SENTRY__` answers the
 * two questions that matter: did this module run, and did it see a DSN.
 */
if (typeof window !== "undefined") {
  ;(window as unknown as Record<string, unknown>).__NUXUS_SENTRY__ = {
    moduleRan: true,
    dsnSeen: SENTRY_DSN.length > 0,
    dsnHost: SENTRY_DSN ? SENTRY_DSN.replace(/\/\/[^@]*@/, "//") : null,
  }
}

if (errorReportingEnabled) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    // Sentry 11 sends no PII by default, but "by default" is not a guarantee
    // worth resting on here: a stack frame on this site can carry a password
    // reset token, a session cookie or a Stripe key. Strip the request envelope
    // explicitly, so the promise holds whatever the defaults do next release.
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies
        delete event.request.headers
        delete event.request.data
      }
      delete event.user
      return event
    },
    // Session replay is off: it records what people type, which on this site
    // includes passwords and card-adjacent fields on the way to Stripe.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  })
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
