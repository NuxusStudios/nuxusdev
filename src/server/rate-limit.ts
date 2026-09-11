import "server-only"

/**
 * Fixed-window rate limiter.
 *
 * In-process, so it only protects a single instance — good enough for a single
 * container or local development. On multi-instance hosting this must be backed
 * by Redis or the platform's own limiter; the interface is deliberately narrow
 * so swapping the store is a one-file change.
 *
 * Better Auth applies its own limiter to /api/auth/* independently; this covers
 * the application's own mutations.
 */
interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()
let lastSweep = Date.now()

function sweep(now: number) {
  if (now - lastSweep < 60_000) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(
  key: string,
  { max, windowSeconds }: { max: number; windowSeconds: number }
): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { ok: true, remaining: max - 1, retryAfterSeconds: 0 }
  }

  bucket.count += 1

  if (bucket.count > max) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000),
    }
  }

  return { ok: true, remaining: max - bucket.count, retryAfterSeconds: 0 }
}

export class RateLimitError extends Error {
  constructor(public retryAfterSeconds: number) {
    super(`Too many requests. Try again in ${retryAfterSeconds}s.`)
    this.name = "RateLimitError"
  }
}

/** Throws when the caller is over budget. */
export function enforceRateLimit(
  key: string,
  options: { max: number; windowSeconds: number }
): void {
  const result = rateLimit(key, options)
  if (!result.ok) throw new RateLimitError(result.retryAfterSeconds)
}
