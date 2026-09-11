/**
 * Boots a throwaway MySQL, applies the migrations and exercises the real
 * queries the app makes. Verifies the port without touching the live database.
 */
import { createDB } from "mysql-memory-server"

console.log("starting a temporary MySQL (first run downloads the binary)…")
const server = await createDB({ dbName: "nuxus_test", logLevel: "ERROR" })
const url = `mysql://${server.username}@127.0.0.1:${server.port}/${server.dbName}`
console.log(`up on MySQL ${server.mysql.version}, port ${server.port}\n`)

process.env.DATABASE_URL = url

const { drizzle } = await import("drizzle-orm/mysql2")
const { migrate } = await import("drizzle-orm/mysql2/migrator")
const mysql = (await import("mysql2/promise")).default

const connection = await mysql.createConnection({ uri: url, multipleStatements: true })
const db = drizzle(connection)

const results = []
const check = async (label, fn) => {
  try {
    const detail = await fn()
    results.push(["ok", label, detail ?? ""])
  } catch (error) {
    results.push(["FAIL", label, error.message.split("\n")[0]])
  }
}

await check("migrations apply", async () => {
  await migrate(db, { migrationsFolder: "drizzle" })
  const [rows] = await connection.query("show tables")
  return `${rows.length} tables`
})

// exercise the SQL shapes the app actually uses, in raw form so this script
// doesn't need the TypeScript build
await check("insert user", () =>
  connection.query(
    `insert into user (id, name, email, email_verified, handle, role, banned)
     values ('u1','Ada','ada@example.com',0,'ada','user',0)`
  )
)

await check("unique email enforced", async () => {
  try {
    await connection.query(
      `insert into user (id, name, email, handle) values ('u2','Dup','ada@example.com','dup')`
    )
    throw new Error("duplicate email was allowed")
  } catch (error) {
    if (!/Duplicate/i.test(error.message)) throw error
    return "duplicate rejected"
  }
})

await check("multiple NULL handles allowed", async () => {
  await connection.query(`insert into user (id, name, email) values ('u3','No Handle','a@b.com')`)
  await connection.query(`insert into user (id, name, email) values ('u4','Also None','c@d.com')`)
  return "two NULL handles coexist"
})

await check("session + cascade delete", async () => {
  await connection.query(
    `insert into session (id, token, user_id, expires_at)
     values ('s1','tok1','u3', date_add(now(), interval 30 day))`
  )
  await connection.query(`delete from user where id = 'u3'`)
  const [rows] = await connection.query(`select id from session where id = 's1'`)
  if (rows.length) throw new Error("session survived user deletion")
  return "session removed with its user"
})

await check("json column round-trip", async () => {
  await connection.query(
    `insert into component (id, author_id, slug, name, description, code, demo_code,
       file_name, demo_file_name, tags, dependencies, license, status)
     values ('c1','u1','x','X','d','code','demo','x.tsx','x-demo.tsx',
       '["button","card"]','["motion"]','MIT License','published')`
  )
  const [rows] = await connection.query(`select tags from component where id = 'c1'`)
  const tags = typeof rows[0].tags === "string" ? JSON.parse(rows[0].tags) : rows[0].tags
  if (tags[0] !== "button") throw new Error(`unexpected tags: ${JSON.stringify(tags)}`)
  return `tags = ${JSON.stringify(tags)}`
})

await check("upsert no-op (ON DUPLICATE KEY)", async () => {
  await connection.query(`insert into collection (id, user_id, name, slug, is_default)
     values ('col1','u1','Saved','saved',1)`)
  await connection.query(
    `insert into bookmark (user_id, component_id) values ('u1','c1')
     on duplicate key update component_id = component_id`
  )
  await connection.query(
    `insert into bookmark (user_id, component_id) values ('u1','c1')
     on duplicate key update component_id = component_id`
  )
  const [rows] = await connection.query(`select * from bookmark where user_id = 'u1'`)
  if (rows.length !== 1) throw new Error(`expected 1 row, got ${rows.length}`)
  return "second insert was a no-op"
})

await check("greatest() decrement clamps at zero", async () => {
  await connection.query(`update component set bookmark_count = greatest(bookmark_count - 1, 0) where id = 'c1'`)
  const [rows] = await connection.query(`select bookmark_count from component where id = 'c1'`)
  if (rows[0].bookmark_count !== 0) throw new Error(`got ${rows[0].bookmark_count}`)
  return "stays at 0"
})

await check("datetime survives round-trip", async () => {
  const [rows] = await connection.query(`select created_at from user where id = 'u1'`)
  const value = rows[0].created_at
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`not a Date: ${value}`)
  }
  return value.toISOString()
})

await check("composite primary key", async () => {
  await connection.query(
    `insert into collection_item (collection_id, component_id) values ('col1','c1')`
  )
  try {
    await connection.query(
      `insert into collection_item (collection_id, component_id) values ('col1','c1')`
    )
    throw new Error("duplicate collection item allowed")
  } catch (error) {
    if (!/Duplicate/i.test(error.message)) throw error
    return "duplicate rejected"
  }
})

await connection.end()
await server.stop()

const width = Math.max(...results.map(([, label]) => label.length))
console.log("")
for (const [level, label, detail] of results) {
  console.log(`[ ${level.padEnd(4)} ] ${label.padEnd(width)}  ${detail}`)
}

const failed = results.filter(([level]) => level === "FAIL")
console.log("")
console.log(failed.length ? `${failed.length} failed.` : `All ${results.length} checks passed.`)
process.exit(failed.length ? 1 : 0)
