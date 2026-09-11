#!/usr/bin/env node
/**
 * Marks existing accounts as email-verified.
 *
 * Turning on RESEND_API_KEY flips `requireEmailVerification` to true, which
 * applies to accounts that already exist — anyone who signed up while
 * verification was off is locked out of password sign-in until they verify.
 *
 * Run this ONCE, against production, immediately before setting the key, to
 * grandfather those accounts in. New signups verify normally afterwards.
 *
 *   node scripts/verify-existing-users.mjs           # dry run, lists them
 *   node scripts/verify-existing-users.mjs --apply   # actually updates
 *
 * Accounts created through GitHub or Google already have a verified address
 * from the provider and are skipped.
 */
import { readFileSync } from "node:fs"
import mysql from "mysql2/promise"

const apply = process.argv.includes("--apply")

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  try {
    const match = readFileSync(".env.local", "utf8").match(/^DATABASE_URL=(.*)$/m)
    if (match) return match[1].trim().replace(/^["']|["']$/g, "")
  } catch {
    /* fall through to the error below */
  }
  console.error("DATABASE_URL is not set. Export it, or run this from a directory with .env.local.")
  process.exit(1)
}

const url = databaseUrl()
const connection = await mysql.createConnection(url)

const host = new URL(url.replace(/^mysql:/, "http:")).host
console.log(`[verify] ${apply ? "applying to" : "dry run against"} ${host}\n`)

const [rows] = await connection.query(
  `SELECT u.id, u.email, u.created_at,
          EXISTS(SELECT 1 FROM account a WHERE a.user_id = u.id AND a.provider_id <> 'credential') AS social
     FROM user u
    WHERE u.email_verified = 0
    ORDER BY u.created_at`
)

if (rows.length === 0) {
  console.log("Nothing to do — every account is already verified.")
  await connection.end()
  process.exit(0)
}

for (const row of rows) {
  const via = row.social ? "social login" : "password"
  console.log(`  ${row.email.padEnd(34)} ${via.padEnd(13)} ${new Date(row.created_at).toISOString().slice(0, 10)}`)
}

console.log(`\n${rows.length} unverified account${rows.length === 1 ? "" : "s"}.`)

if (!apply) {
  console.log("\nNothing changed. Re-run with --apply to mark these verified.")
  await connection.end()
  process.exit(0)
}

const [result] = await connection.query(
  `UPDATE user SET email_verified = 1, updated_at = NOW(3) WHERE email_verified = 0`
)

console.log(`\nMarked ${result.affectedRows} account${result.affectedRows === 1 ? "" : "s"} verified.`)
console.log("Set RESEND_API_KEY and EMAIL_FROM now — new signups will verify normally.")

await connection.end()
