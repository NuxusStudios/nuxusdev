/**
 * Exercises the credit ledger against the real database.
 *
 * Credits are money, so the arithmetic gets a test rather than a careful read.
 * Creates its own user and removes it afterwards.
 */
import { db, schema } from "../src/server/db"
import { getBalance, refund, spend, OutOfCreditsError } from "../src/server/credits"
import { eq } from "drizzle-orm"

const USER = "credit_test_user"
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

async function main() {
  const now = new Date()
  await db.delete(schema.creditLedger).where(eq(schema.creditLedger.userId, USER))
  await db.delete(schema.user).where(eq(schema.user.id, USER))
  await db.insert(schema.user).values({
    id: USER,
    name: "Credit Test",
    email: "credits@test.local",
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  })

  const allowance = 10

  check("starts full", (await getBalance(USER, allowance)).remaining, allowance)

  await spend(USER, 1, "theme", { allowance })
  check("one spend", (await getBalance(USER, allowance)).remaining, 9)
  check("usage tracked", (await getBalance(USER, allowance)).used, 1)

  await spend(USER, 4, "theme", { allowance })
  check("accumulates", (await getBalance(USER, allowance)).remaining, 5)

  await refund(USER, 4, "theme")
  check("refund restores", (await getBalance(USER, allowance)).remaining, 9)

  await spend(USER, 9, "theme", { allowance })
  check("spend to zero", (await getBalance(USER, allowance)).remaining, 0)

  // the ledger, not the UI, is what refuses
  let refused = false
  try {
    await spend(USER, 1, "theme", { allowance })
  } catch (error) {
    refused = error instanceof OutOfCreditsError
  }
  check("refuses when empty", refused, true)
  check("balance never negative", (await getBalance(USER, allowance)).remaining, 0)

  // a bigger plan sees the same usage against a larger allowance
  check("allowance is per-plan", (await getBalance(USER, 50)).remaining, 40)

  const rows = await db
    .select()
    .from(schema.creditLedger)
    .where(eq(schema.creditLedger.userId, USER))
  check("every movement recorded", rows.length, 4)

  await db.delete(schema.creditLedger).where(eq(schema.creditLedger.userId, USER))
  await db.delete(schema.user).where(eq(schema.user.id, USER))

  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURES`)
  process.exit(failures === 0 ? 0 : 1)
}

void main()
