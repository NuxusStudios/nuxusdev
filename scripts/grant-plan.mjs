/**
 * Grants a plan to a user directly in MySQL. Stand-in for the billing webhook
 * until a payment provider is wired up.
 *
 *   node scripts/grant-plan.mjs someone@example.com builder
 *   node scripts/grant-plan.mjs someone@example.com free      (revokes)
 *
 * In development you can also POST /api/dev/grant-plan while signed in.
 */
import { randomUUID } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
    }
  }
}

const [email, plan = "builder"] = process.argv.slice(2)
const VALID = ["free", "builder", "builder_ai", "team"]

if (!email || !VALID.includes(plan)) {
  console.error("usage: node scripts/grant-plan.mjs <email> [free|builder|builder_ai|team]")
  process.exit(1)
}

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL is not set.")
  process.exit(1)
}

const mysql = (await import("mysql2/promise")).default
const connection = await mysql.createConnection({ uri: url })

const [users] = await connection.query("select id from `user` where email = ?", [email])
if (!users.length) {
  console.error(`no user with email ${email}`)
  await connection.end()
  process.exit(1)
}

const userId = users[0].id

await connection.query(
  "update subscription set status = 'canceled', updated_at = now(3) where user_id = ?",
  [userId]
)

if (plan === "free") {
  console.log(`revoked all plans for ${email}`)
} else {
  const periodEnd = new Date(Date.now() + 31 * 24 * 60 * 60 * 1000)
  await connection.query(
    `insert into subscription (id, user_id, plan, status, seats, current_period_end, provider)
     values (?, ?, ?, 'active', 1, ?, 'manual')`,
    [randomUUID(), userId, plan, periodEnd]
  )
  console.log(`granted ${plan} to ${email} until ${periodEnd.toISOString().slice(0, 10)}`)
}

await connection.end()
