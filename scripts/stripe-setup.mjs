/**
 * Creates the Stripe products and prices from src/lib/pricing.json, then writes
 * the resulting price ids into .env.local.
 *
 *   npm run stripe:setup            # dry run — shows what it would create
 *   npm run stripe:setup -- --apply # actually create them
 *
 * Reads STRIPE_SECRET_KEY from your environment or .env.local. The key stays on
 * your machine; nothing prints it.
 *
 * Idempotent: every price carries a lookup_key, so re-running finds what
 * already exists instead of creating duplicates. Stripe prices are immutable,
 * so changing an amount in pricing.json creates a new price and leaves the old
 * one in place (archive it in the dashboard once nobody is subscribed to it).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import path from "node:path"
import Stripe from "stripe"

const ENV_FILE = ".env.local"

for (const file of [ENV_FILE, ".env"]) {
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "")
    }
  }
}

const apply = process.argv.includes("--apply")
const key = process.env.STRIPE_SECRET_KEY

if (!key) {
  console.error(
    `STRIPE_SECRET_KEY is not set.\n\n` +
      `Add it to ${ENV_FILE} yourself — do not paste it into a chat:\n` +
      `  STRIPE_SECRET_KEY=sk_test_...\n\n` +
      `Use a TEST key first (dashboard → Developers → API keys, in test mode).`
  )
  process.exit(1)
}

const live = key.startsWith("sk_live_")

if (live && !process.argv.includes("--i-understand-this-is-live")) {
  console.error(
    `That is a LIVE key. Products created now are real and customers can be charged.\n` +
      `Run against a test key first. To proceed anyway, add:\n` +
      `  --i-understand-this-is-live`
  )
  process.exit(1)
}

const catalogue = JSON.parse(readFileSync(path.join("src", "lib", "pricing.json"), "utf8"))
const stripe = new Stripe(key, { apiVersion: "2026-08-26.dahlia" })

const money = (cents) => `$${(cents / 100).toLocaleString("en-US")}`
const envKey = (planId, cycle, credits) =>
  `STRIPE_PRICE_${planId.toUpperCase()}_${cycle.toUpperCase()}${credits ? `_${credits}` : ""}`

console.log(
  `\nStripe ${live ? "LIVE" : "test"} mode — ${apply ? "creating" : "dry run, nothing will be created"}\n`
)

const results = []

for (const plan of catalogue.plans) {
  const lookupProduct = `nuxus_${plan.id}`

  let product = null
  if (apply) {
    const found = await stripe.products.search({
      query: `metadata['nuxus_plan']:'${plan.id}'`,
      limit: 1,
    })
    product = found.data[0] ?? null

    if (!product) {
      product = await stripe.products.create({
        name: `Nuxus ${plan.name}`,
        description: plan.description,
        metadata: { nuxus_plan: plan.id, per_seat: String(plan.perSeat) },
      })
      console.log(`  product  created  ${product.name}`)
    } else {
      console.log(`  product  exists   ${product.name}`)
    }
  } else {
    console.log(`  product  would create  Nuxus ${plan.name}`)
  }

  for (const price of plan.prices) {
    const months = catalogue.monthsPerCycle[price.cycle]
    const unitAmount = Math.round(price.monthly * months * 100)
    const lookupKey = `${lookupProduct}_${price.cycle}${price.credits ? `_${price.credits}` : ""}`
    const variable = envKey(plan.id, price.cycle, price.credits)

    const label =
      `${plan.name} · ${price.cycle}` +
      (price.credits ? ` · ${price.credits} credits` : "") +
      ` · ${money(unitAmount)}${plan.perSeat ? "/seat" : ""} every ${months}mo`

    if (!apply) {
      console.log(`  price    would create  ${label}`)
      results.push({ variable, id: "(dry run)" })
      continue
    }

    const existing = await stripe.prices.list({ lookup_keys: [lookupKey], limit: 1 })
    let priceObject = existing.data[0] ?? null

    if (priceObject && priceObject.unit_amount !== unitAmount) {
      // prices are immutable — retire the old lookup key and make a new price
      await stripe.prices.update(priceObject.id, { lookup_key: `${lookupKey}_old_${Date.now()}` })
      console.log(
        `  price    amount changed for ${lookupKey} ` +
          `(${money(priceObject.unit_amount)} → ${money(unitAmount)}), creating a replacement`
      )
      priceObject = null
    }

    if (!priceObject) {
      priceObject = await stripe.prices.create({
        product: product.id,
        currency: catalogue.currency,
        unit_amount: unitAmount,
        recurring: { interval: "month", interval_count: months },
        lookup_key: lookupKey,
        transfer_lookup_key: true,
        nickname: label,
        metadata: {
          nuxus_plan: plan.id,
          cycle: price.cycle,
          credits: String(price.credits ?? 0),
          monthly_display: String(price.monthly),
        },
      })
      console.log(`  price    created  ${label}`)
    } else {
      console.log(`  price    exists   ${label}`)
    }

    results.push({ variable, id: priceObject.id })
  }
}

console.log("")

if (!apply) {
  console.log(`Nothing was created. Re-run with --apply to create ${results.length} prices.\n`)
  process.exit(0)
}

// write the ids back into .env.local
let envText = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : ""
let added = 0
let updated = 0

for (const { variable, id } of results) {
  const line = `${variable}=${id}`
  const pattern = new RegExp(`^${variable}=.*$`, "m")
  if (pattern.test(envText)) {
    if (!envText.includes(line)) updated++
    envText = envText.replace(pattern, line)
  } else {
    envText = envText.replace(/\s*$/, "\n") + line + "\n"
    added++
  }
}

writeFileSync(ENV_FILE, envText)

console.log(`Wrote ${results.length} price ids to ${ENV_FILE} (${added} added, ${updated} updated).`)
console.log(`\nNext:`)
console.log(`  1. Copy those STRIPE_PRICE_* lines into your Hostinger environment variables`)
console.log(`  2. Add a webhook endpoint in Stripe → ${process.env.BETTER_AUTH_URL ?? "https://your-domain"}/api/stripe/webhook`)
console.log(`     events: checkout.session.completed, customer.subscription.created/updated/deleted`)
console.log(`  3. Put its signing secret in STRIPE_WEBHOOK_SECRET`)
console.log(`  4. npm run auth:check\n`)
