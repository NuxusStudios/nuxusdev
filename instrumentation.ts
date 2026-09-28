import * as Sentry from "@sentry/nextjs"
import { SENTRY_DSN, errorReportingEnabled } from "@/lib/observability"

/**
 * Server and edge error reporting.
 *
 * Next calls `register` once per runtime at boot. Both branches are guarded on
 * a DSN being present so a deployment without one starts no client and sends
 * nothing — which is the state this ships in.
 */
export async function register() {
  if (!errorReportingEnabled) return

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV,
    // A sample of traces, not all of them: this is an error tracker first, and
    // full tracing on every request is the line item that surprises people.
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
  })
}

export const onRequestError = Sentry.captureRequestError
