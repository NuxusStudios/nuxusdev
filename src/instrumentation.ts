/**
 * Runs once when the server process starts.
 *
 * Hostinger launches Next directly rather than through `npm start`, so the
 * `prestart` script never fires there. This hook is part of the framework and
 * runs wherever the app runs, which makes it the reliable place to bring the
 * database schema up to date on deploy.
 *
 * Drizzle records applied migrations, so this is a no-op on every boot after
 * the first. A failure is logged loudly but does not take the process down —
 * most of this site is public content that reads no database, and serving it
 * beats a blank domain while the cause is investigated.
 */
export async function register() {
  // only the Node runtime; the edge runtime has no database driver
  if (process.env.NEXT_RUNTIME !== "nodejs") return

  // `next build` imports this file but must never touch a real database
  if (process.env.NEXT_PHASE === "phase-production-build") return

  if (!process.env.DATABASE_URL) {
    console.error("[startup] DATABASE_URL is not set — skipping migrations")
    return
  }

  try {
    const [{ drizzle }, { migrate }, mysql] = await Promise.all([
      import("drizzle-orm/mysql2"),
      import("drizzle-orm/mysql2/migrator"),
      import("mysql2/promise").then((m) => m.default),
    ])

    const connection = await mysql.createConnection({
      uri: process.env.DATABASE_URL,
      multipleStatements: true,
    })

    try {
      await migrate(drizzle(connection), { migrationsFolder: "drizzle" })
      console.log("[startup] database schema is up to date")
    } finally {
      await connection.end().catch(() => {})
    }
  } catch (error) {
    console.error(
      "[startup] migrations failed — sign-in and bookmarks will not work:",
      error instanceof Error ? error.message : error
    )
  }
}
