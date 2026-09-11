/**
 * Boots a local MySQL for development and keeps it running until Ctrl-C.
 *
 *   npm run db:dev        # terminal 1 — prints the DATABASE_URL to use
 *   npm run dev           # terminal 2
 *
 * Data is ephemeral: every start is a fresh, migrated database. For persistent
 * local data, point DATABASE_URL at a real MySQL instead.
 */
import { writeFileSync } from "node:fs"
import { createDB } from "mysql-memory-server"

const server = await createDB({ dbName: "nuxus_dev", logLevel: "ERROR" })
const url = `mysql://${server.username}@127.0.0.1:${server.port}/${server.dbName}`

const { drizzle } = await import("drizzle-orm/mysql2")
const { migrate } = await import("drizzle-orm/mysql2/migrator")
const mysql = (await import("mysql2/promise")).default

const connection = await mysql.createConnection({ uri: url, multipleStatements: true })
await migrate(drizzle(connection), { migrationsFolder: "drizzle" })
await connection.end()

writeFileSync(".env.dev-db", `DATABASE_URL=${url}\n`)

console.log(`\nMySQL ${server.mysql.version} on port ${server.port}`)
console.log(`DATABASE_URL=${url}`)
console.log(`\nwritten to .env.dev-db — migrations applied, ${"Ctrl-C"} to stop\n`)

const shutdown = async () => {
  await server.stop().catch(() => {})
  process.exit(0)
}
process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

// stay alive
setInterval(() => {}, 1 << 30)
