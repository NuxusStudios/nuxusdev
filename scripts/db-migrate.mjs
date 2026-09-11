/**
 * Applies the generated SQL migrations to the MySQL database in DATABASE_URL.
 */
import { existsSync } from "node:fs"
import { readFileSync } from "node:fs"
import path from "node:path"

// load .env.local so this works without exporting vars by hand
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
  console.error(
    "DATABASE_URL is not set.\n" +
      "Expected: mysql://user:password@localhost:3306/database"
  )
  process.exit(1)
}

if (!existsSync(folder)) {
  console.error("No drizzle/ folder — run `npm run db:generate` first.")
  process.exit(1)
}

const { drizzle } = await import("drizzle-orm/mysql2")
const { migrate } = await import("drizzle-orm/mysql2/migrator")
const mysql = (await import("mysql2/promise")).default

const connection = await mysql.createConnection({ uri: url, multipleStatements: true })
await migrate(drizzle(connection), { migrationsFolder: folder })
await connection.end()

console.log(`migrations applied to ${new URL(url).host}`)
