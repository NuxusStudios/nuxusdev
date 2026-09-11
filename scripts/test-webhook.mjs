/**
 * Verifies the Stripe webhook rejects anything it cannot authenticate.
 *
 * Uses Stripe's own signing helper with a local test secret — no network calls
 * and no real keys. Run the dev server with matching STRIPE_* values first.
 */
import Stripe from "stripe"

const base = process.argv[2] ?? "http://localhost:3100"
const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "whsec_test_secret_for_local_verification"
const endpoint = `${base}/api/stripe/webhook`

const payload = JSON.stringify({
  id: "evt_test_1",
  object: "event",
  type: "customer.subscription.updated",
  data: { object: { id: "sub_test_1", object: "subscription" } },
})

const post = (headers) =>
  fetch(endpoint, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: payload })

const results = []
const check = async (label, expected, run) => {
  try {
    const res = await run()
    const ok = expected(res.status)
    results.push([ok ? "ok" : "FAIL", label, `HTTP ${res.status}`])
  } catch (error) {
    results.push(["FAIL", label, error.message])
  }
}

// 1. no signature at all
await check("rejects a request with no signature", (s) => s === 400, () => post({}))

// 2. a made-up signature
await check("rejects a forged signature", (s) => s === 400, () =>
  post({ "stripe-signature": "t=1,v1=deadbeef" })
)

// 3. correctly signed, but with the wrong secret
const wrong = Stripe.webhooks.generateTestHeaderString({
  payload,
  secret: "whsec_a_different_secret_entirely",
})
await check("rejects a signature from the wrong secret", (s) => s === 400, () =>
  post({ "stripe-signature": wrong })
)

// 4. a replayed old timestamp — outside Stripe's tolerance window
const stale = Stripe.webhooks.generateTestHeaderString({
  payload,
  secret,
  timestamp: Math.floor(Date.now() / 1000) - 60 * 60,
})
await check("rejects a replayed, stale signature", (s) => s === 400, () =>
  post({ "stripe-signature": stale })
)

// 5. a genuine signature — must get past verification (anything but 400)
const valid = Stripe.webhooks.generateTestHeaderString({ payload, secret })
await check("accepts a correctly signed payload", (s) => s !== 400, () =>
  post({ "stripe-signature": valid })
)

const width = Math.max(...results.map(([, label]) => label.length))
console.log("")
for (const [level, label, detail] of results) {
  console.log(`[ ${level.padEnd(4)} ] ${label.padEnd(width)}  ${detail}`)
}
const failed = results.filter(([l]) => l === "FAIL")
console.log("")
console.log(failed.length ? `${failed.length} failed.` : `All ${results.length} checks passed.`)
process.exit(failed.length ? 1 : 0)
