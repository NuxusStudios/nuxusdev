import "server-only"
import fs from "node:fs"
import path from "node:path"

/**
 * Applies pending migrations. Kept in its own module so Next never compiles
 * these Node built-ins for the Edge runtime — instrumentation.ts imports it
 * dynamically, and only when running under Node.
 */
export async function migrateOnBoot(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error("[startup] DATABASE_URL is not set — skipping migrations")
    return
  }

  const [{ drizzle }, { migrate }, mysql] = await Promise.all([
    import("drizzle-orm/mysql2"),
    import("drizzle-orm/mysql2/migrator"),
    import("mysql2/promise").then((m) => m.default),
  ])

  // The migrator reads SQL off disk and the working directory is not the app
  // root on every host — Hostinger runs from hbuilds/versions/<id>/nodejs.
  const candidates = [
    path.join(process.cwd(), "drizzle"),
    path.join(process.cwd(), "..", "drizzle"),
    path.join(process.cwd(), "..", "..", "drizzle"),
  ]

  const migrationsFolder = candidates.find((candidate) =>
    fs.existsSync(path.join(candidate, "meta", "_journal.json"))
  )

  if (!migrationsFolder) {
    // The directory listing is diagnostic only. Turbopack can't analyse a
    // dynamic readdir, so without the ignore comment it traces the entire
    // project — every source file and the public folder — into the server
    // bundle.
    const contents = fs
      .readdirSync(/* turbopackIgnore: true */ process.cwd())
      .slice(0, 25)
      .join(", ")

    console.error(
      `[startup] migrations folder not found. cwd=${process.cwd()} ` +
        `contents=[${contents}] tried=[${candidates.join(", ")}]`
    )
    return
  }

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    multipleStatements: true,
  })

  try {
    await migrate(drizzle(connection), { migrationsFolder })
    console.log(`[startup] database schema is up to date (from ${migrationsFolder})`)
  } finally {
    await connection.end().catch(() => {})
  }
}
