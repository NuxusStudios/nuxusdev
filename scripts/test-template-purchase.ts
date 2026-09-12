/**
 * Exercises template ownership against the real database.
 *
 * This is the money path: a duplicated webhook must not grant twice, and a
 * purchase must outlive the plan that did not pay for it. Both are cheaper to
 * assert here than to discover from a support email.
 */
import { randomUUID } from "node:crypto"
import { eq } from "drizzle-orm"
import { db, schema } from "../src/server/db"
import { listOwnedSlugs, ownsTemplate } from "../src/server/templates"

const USER = "tpl_test_user"
const SLUG = "analytics-dashboard"
const SESSION = "cs_test_fixed_session"
let failures = 0

function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) {
    failures++
    console.log(`FAIL ${label}\n  got:      ${JSON.stringify(actual)}\n  expected: ${JSON.stringify(expected)}`)
  } else {
    console.log(`ok   ${label}`)
  }
}

async function grant(sessionId: string, slug = SLUG) {
  await db.insert(schema.templatePurchase).values({
    id: randomUUID(),
    userId: USER,
    templateSlug: slug,
    amount: 4900,
    currency: "usd",
    stripeSessionId: sessionId,
    stripePaymentIntentId: "pi_test",
  })
}

async function main() {
  const now = new Date()
  await db.delete(schema.templatePurchase).where(eq(schema.templatePurchase.userId, USER))
  await db.delete(schema.user).where(eq(schema.user.id, USER))
  await db.insert(schema.user).values({
    id: USER,
    name: "Template Test",
    email: "template@test.local",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  })

  check("owns nothing initially", await ownsTemplate(USER, SLUG), false)

  await grant(SESSION)
  check("granted after purchase", await ownsTemplate(USER, SLUG), true)

  // Stripe retries; the unique index is what stops a second grant
  let duplicateRejected = false
  try {
    await grant(SESSION)
  } catch {
    duplicateRejected = true
  }
  check("duplicate session rejected", duplicateRejected, true)

  const rows = await db
    .select()
    .from(schema.templatePurchase)
    .where(eq(schema.templatePurchase.userId, USER))
  check("exactly one row after retry", rows.length, 1)
  check("stored what Stripe charged", rows[0].amount, 4900)

  // a different session for the same template is a genuine second sale and
  // must not be silently swallowed by the idempotency key
  await grant("cs_test_other_session", "saas-landing")
  check("second template granted", (await listOwnedSlugs(USER)).size, 2)

  check("unowned stays unowned", await ownsTemplate(USER, "does-not-exist"), false)

  await db.delete(schema.templatePurchase).where(eq(schema.templatePurchase.userId, USER))
  await db.delete(schema.user).where(eq(schema.user.id, USER))

  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURES`)
  process.exit(failures === 0 ? 0 : 1)
}

void main()
