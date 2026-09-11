/**
 * Preflight for authentication. Run it after setting env vars, and again on the
 * server before you announce the site.
 *
 *   npm run auth:check
 *
 * Checks configuration and connectivity. Never prints secret values.
 */
import { readFileSync, existsSync } from "node:fs"

// load .env.local without a dependency
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue
    process.env[key] = rawValue.replace(/^["']|["']$/g, "")
  }
}

const results = []
const add = (level, label, detail) => results.push({ level, label, detail })

const env = process.env
const isProd = env.NODE_ENV === "production"

// ── secret ───────────────────────────────────────────────────────────────
const secret = env.BETTER_AUTH_SECRET
if (!secret) {
  add("fail", "BETTER_AUTH_SECRET", "missing — sessions cannot be signed")
} else if (secret.length < 32) {
  add("fail", "BETTER_AUTH_SECRET", `only ${secret.length} chars — needs 32+`)
} else if (secret.includes("dev-only")) {
  add("fail", "BETTER_AUTH_SECRET", "still the development placeholder")
} else {
  add("ok", "BETTER_AUTH_SECRET", `${secret.length} chars`)
}

// ── public URL ───────────────────────────────────────────────────────────
const siteUrl = env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_SITE_URL
if (!siteUrl) {
  add("fail", "BETTER_AUTH_URL", "missing — OAuth callbacks and emails need it")
} else if (isProd && siteUrl.startsWith("http://")) {
  add("fail", "BETTER_AUTH_URL", `${siteUrl} — must be https in production`)
} else if (isProd && siteUrl.includes("localhost")) {
  add("fail", "BETTER_AUTH_URL", `${siteUrl} — still points at localhost`)
} else {
  add("ok", "BETTER_AUTH_URL", siteUrl)
}

// ── database ─────────────────────────────────────────────────────────────
const url = env.DATABASE_URL
const TABLES = [
  "user", "session", "account", "verification",
  "subscription", "component", "collection", "collection_item", "bookmark",
]

async function checkDatabase() {
  if (!url) {
    add("fail", "DATABASE_URL", "missing — expected mysql://user:pass@host:3306/database")
    return
  }

  if (!url.startsWith("mysql://")) {
    add("fail", "DATABASE_URL", "not a mysql:// connection string")
    return
  }

  let connection
  let dbName
  try {
    const mysql = (await import("mysql2/promise")).default
    connection = await mysql.createConnection({ uri: url, connectTimeout: 10_000 })
    dbName = new URL(url).pathname.replace(/^\//, "")
    const host = new URL(url).hostname
    add(
      "ok",
      "DATABASE_URL",
      host === "localhost" || host === "127.0.0.1"
        ? `${host} (same host as the app — not exposed publicly)`
        : `${host} (remote — confirm the IP is whitelisted)`
    )
  } catch (error) {
    add("fail", "DATABASE_URL", `could not connect: ${error.message}`)
    return
  }

  const query = async (text) => {
    const [rows] = await connection.query(text)
    return rows
  }
  const close = () => connection.end()

  try {
    const rows = await query(
      `select table_name as table_name from information_schema.tables
       where table_schema = '${dbName}'`
    )
    const present = new Set(rows.map((row) => row.table_name ?? row.TABLE_NAME))
    const missing = TABLES.filter((table) => !present.has(table))

    if (missing.length) {
      add("fail", "migrations", `missing tables: ${missing.join(", ")} — run npm run db:migrate`)
    } else {
      add("ok", "migrations", `all ${TABLES.length} tables present`)
    }

    if (present.has("user")) {
      const rows = await query("select count(*) as count from `user`")
      const count = Number(rows[0].count)
      add("info", "accounts", `${count} user${count === 1 ? "" : "s"} registered`)
    }
  } catch (error) {
    add("fail", "database", error.message)
  } finally {
    await close()
  }
}

await checkDatabase()

// ── sign-in methods ──────────────────────────────────────────────────────
const callbackBase = siteUrl ? `${siteUrl.replace(/\/$/, "")}/api/auth/callback` : "<BETTER_AUTH_URL>/api/auth/callback"

add("ok", "email + password", "always available")

for (const [name, id, secretKey] of [
  ["GitHub", "GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
  ["Google", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
]) {
  const provider = name.toLowerCase()
  if (env[id] && env[secretKey]) {
    add("ok", `${name} OAuth`, `callback ${callbackBase}/${provider}`)
  } else if (env[id] || env[secretKey]) {
    add("fail", `${name} OAuth`, "only half configured — needs both id and secret")
  } else {
    add("warn", `${name} OAuth`, "not configured — button hidden")
  }
}

if (env.RESEND_API_KEY && env.EMAIL_FROM) {
  add("ok", "email delivery", `from ${env.EMAIL_FROM}`)
  add("ok", "email verification", "enforced before sign-in")
} else {
  add(
    isProd ? "fail" : "warn",
    "email delivery",
    isProd
      ? "RESEND_API_KEY / EMAIL_FROM missing — magic links and verification will fail"
      : "not configured — links print to the server console, verification is NOT enforced"
  )
}

// ── billing ──────────────────────────────────────────────────────────────
const stripeKey = env.STRIPE_SECRET_KEY
const stripeHook = env.STRIPE_WEBHOOK_SECRET

if (!stripeKey && !stripeHook) {
  add("warn", "billing", "not configured — plans cannot be purchased")
} else if (!stripeKey || !stripeHook) {
  add("fail", "billing", "needs both STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET")
} else {
  const live = stripeKey.startsWith("sk_live_")
  if (isProd && !live) {
    add("warn", "billing", "using TEST keys in production — no real payments")
  } else if (!isProd && live) {
    add("fail", "billing", "LIVE keys outside production — real cards would be charged")
  } else {
    add("ok", "billing", live ? "live mode" : "test mode")
  }

  const prices = {
    Builder: ["STRIPE_PRICE_BUILDER_QUARTERLY", "STRIPE_PRICE_BUILDER_YEARLY"],
    "Builder + AI": [
      "STRIPE_PRICE_BUILDER_AI_QUARTERLY_500",
      "STRIPE_PRICE_BUILDER_AI_QUARTERLY_1000",
      "STRIPE_PRICE_BUILDER_AI_QUARTERLY_2000",
      "STRIPE_PRICE_BUILDER_AI_YEARLY_500",
      "STRIPE_PRICE_BUILDER_AI_YEARLY_1000",
      "STRIPE_PRICE_BUILDER_AI_YEARLY_2000",
    ],
    Team: ["STRIPE_PRICE_TEAM_QUARTERLY", "STRIPE_PRICE_TEAM_YEARLY"],
    "Team + AI": [
      "STRIPE_PRICE_TEAM_AI_QUARTERLY_500",
      "STRIPE_PRICE_TEAM_AI_QUARTERLY_1000",
      "STRIPE_PRICE_TEAM_AI_QUARTERLY_2000",
      "STRIPE_PRICE_TEAM_AI_YEARLY_500",
      "STRIPE_PRICE_TEAM_AI_YEARLY_1000",
      "STRIPE_PRICE_TEAM_AI_YEARLY_2000",
    ],
  }

  let anyPrice = false
  for (const [name, keys] of Object.entries(prices)) {
    const set = keys.filter((key) => env[key])
    if (set.length === 0) {
      add("warn", `${name} prices`, "none set — plan hidden")
    } else if (set.length === keys.length) {
      add("ok", `${name} prices`, `all ${keys.length} configured`)
      anyPrice = true
    } else {
      const missing = keys.filter((key) => !env[key])
      add("warn", `${name} prices`, `${set.length}/${keys.length} set — missing ${missing.join(", ")}`)
      anyPrice = true
    }
  }

  if (!anyPrice) {
    add("fail", "purchasable plans", "no STRIPE_PRICE_* ids set — nothing can be bought")
  }

  add("info", "webhook endpoint", `${siteUrl ?? "<BETTER_AUTH_URL>"}/api/stripe/webhook`)
}

// ── report ───────────────────────────────────────────────────────────────
const ICON = { ok: "  ok  ", warn: " warn ", fail: " FAIL ", info: " info " }
const WIDTH = Math.max(...results.map((r) => r.label.length))

console.log(`\nAuth preflight — NODE_ENV=${env.NODE_ENV ?? "development"}\n`)
for (const { level, label, detail } of results) {
  console.log(`[${ICON[level]}] ${label.padEnd(WIDTH)}  ${detail}`)
}

const failures = results.filter((r) => r.level === "fail")
const warnings = results.filter((r) => r.level === "warn")

console.log("")
if (failures.length) {
  console.log(`${failures.length} blocking problem${failures.length === 1 ? "" : "s"}.`)
  process.exit(1)
}
console.log(
  warnings.length
    ? `Ready, with ${warnings.length} thing${warnings.length === 1 ? "" : "s"} to be aware of.`
    : "Ready."
)
