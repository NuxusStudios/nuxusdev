/**
 * Google Analytics 4.
 *
 * The measurement ID is committed rather than read from the environment. It is
 * public by definition — it ships in the page source of every site using GA —
 * so there is nothing to protect, and a `NEXT_PUBLIC_` variable would only add
 * a build-time inlining step that can silently resolve to empty and leave
 * analytics quietly dead.
 */
export const GA_MEASUREMENT_ID = "G-RXVETT1DEC"

/**
 * Only measure the real site.
 *
 * Development traffic in the same property makes every number a lie, and the
 * figure people actually act on is the one for yesterday, not for yesterday
 * plus whatever a developer clicked through while building.
 */
export const analyticsEnabled =
  process.env.NODE_ENV === "production" && GA_MEASUREMENT_ID.length > 0
