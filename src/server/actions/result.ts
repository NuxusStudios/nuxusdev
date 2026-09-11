import "server-only"
import { UnauthorizedError } from "@/server/session"
import { RateLimitError } from "@/server/rate-limit"
import { PaymentRequiredError } from "@/server/entitlements"

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? { data?: undefined } : { data: T }))
  | { ok: false; error: string; code?: string }

/**
 * Wraps an action so it never throws across the server/client boundary and
 * never leaks an internal error message to the browser. Expected failures
 * (auth, rate limit, validation) return their own text; anything else is logged
 * server-side and reported generically.
 */
export async function run<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T extends void ? undefined : T>> {
  try {
    const data = await fn()
    return { ok: true, data } as ActionResult<T extends void ? undefined : T>
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return { ok: false, error: error.message, code: "unauthorized" }
    }
    if (error instanceof PaymentRequiredError) {
      return { ok: false, error: error.message, code: `payment_required:${error.reason}` }
    }
    if (error instanceof RateLimitError) {
      return { ok: false, error: error.message, code: "rate_limited" }
    }
    if (error instanceof ValidationError) {
      return { ok: false, error: error.message, code: "invalid" }
    }
    console.error("action failed", error)
    return { ok: false, error: "Something went wrong. Please try again.", code: "internal" }
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}
