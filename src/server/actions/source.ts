"use server"

import { and, eq } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { requireCopyAccess } from "@/server/entitlements"
import { enforceRateLimit } from "@/server/rate-limit"
import { getCurrentUser } from "@/server/session"
import { run, ValidationError } from "@/server/actions/result"
import { readComponentSource, readDemoSource } from "@/lib/source"
import { COMPONENT_MAP } from "@/lib/data/components"
import { buildPrompt, cliCommand } from "@/lib/prompt"
import { toRecord } from "@/server/catalogue"

/**
 * The paywall.
 *
 * Component source, the generated prompt and the CLI command are fetched
 * through this action rather than embedded in the page. A visitor without a
 * plan never receives the text at all — there is nothing in the payload to
 * read out of the network tab, and disabling a button in devtools gets them
 * nowhere.
 */
async function loadSource(componentId: string) {
  const staticRecord = COMPONENT_MAP.get(componentId)

  if (staticRecord) {
    const [code, demoCode] = await Promise.all([
      readComponentSource(staticRecord.previewKey),
      readDemoSource(staticRecord.previewKey),
    ])
    return { record: staticRecord, code, demoCode }
  }

  const [row] = await db
    .select({ component: schema.component, handle: schema.user.handle })
    .from(schema.component)
    .innerJoin(schema.user, eq(schema.user.id, schema.component.authorId))
    .where(
      and(eq(schema.component.id, componentId), eq(schema.component.status, "published"))
    )
    .limit(1)

  if (!row) throw new ValidationError("That component doesn't exist")

  return {
    record: toRecord(row.component, row.handle ?? "unknown"),
    code: row.component.code,
    demoCode: row.component.demoCode,
  }
}

export type CopyKind = "prompt" | "component" | "demo" | "cli"

/** Returns the requested text, or a payment-required error. */
export async function getCopyPayload(
  componentId: string,
  kind: CopyKind,
  manager: "npm" | "pnpm" | "yarn" | "bun" = "npm"
) {
  return run(async () => {
    await requireCopyAccess()

    const user = await getCurrentUser()
    enforceRateLimit(`copy:${user?.id ?? "anon"}`, { max: 240, windowSeconds: 60 })

    const { record, code, demoCode } = await loadSource(componentId)

    switch (kind) {
      case "prompt":
        return { text: buildPrompt({ component: record, code, demoCode }) }
      case "component":
        return { text: code }
      case "demo":
        return { text: demoCode }
      case "cli":
        return { text: cliCommand(record, manager) }
    }
  })
}
