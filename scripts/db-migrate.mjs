/**
 * Applies the generated SQL migrations to the MySQL database in DATABASE_URL.
 *
 * Runs automatically before `next start` via the `prestart` npm script, so a
 * deploy migrates itself and no shell access is needed. Drizzle records what it
 * has applied, so re-running is a no-op.
 *
 * Failing here deliberately stops the server from starting: a half-migrated
 * schema serving traffic is worse than a deploy that visibly failed.
 */
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

// load .env.local when running locally; hosting provides real env vars
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
    }
  }
}

const url = process.env.DATABASE_URL
const folder = path.join(process.cwd(), "drizzle")

if (!url) {
  console.error("[migrate] DATABASE_URL is not set — expected mysql://user:pass@host:3306/db")
  process.exit(1)
}

if (!existsSync(folder)) {
  console.error("[migrate] no drizzle/ folder — run `npm run db:generate` first")
  process.exit(1)
}

const { drizzle } = await import("drizzle-orm/mysql2")
const { migrate } = await import("drizzle-orm/mysql2/migrator")
const mysql = (await import("mysql2/promise")).default

const host = (() => {
  try {
    return new URL(url).host
  } catch {
    return "the configured host"
  }
})()

/** a cold database on shared hosting can refuse the first connection */
const ATTEMPTS = 5
let connection

for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
  try {
    connection = await mysql.createConnection({ uri: url, multipleStatements: true })
    break
  } catch (error) {
    if (attempt === ATTEMPTS) {
      console.error(`[migrate] could not connect to ${host}: ${error.message}`)
      process.exit(1)
    }
    const wait = attempt * 1000
    console.warn(`[migrate] connection attempt ${attempt}/${ATTEMPTS} failed, retrying in ${wait}ms`)
    await new Promise((resolve) => setTimeout(resolve, wait))
  }
}

try {
  await migrate(drizzle(connection), { migrationsFolder: folder })
  console.log(`[migrate] schema up to date on ${host}`)
} catch (error) {
  console.error(`[migrate] failed: ${error.message}`)
  process.exit(1)
} finally {
  await connection.end().catch(() => {})
}
