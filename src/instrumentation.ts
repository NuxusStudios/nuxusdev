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
 */
export async function register() {
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
