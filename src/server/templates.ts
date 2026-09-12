import "server-only"
import { and, eq, inArray } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { getEntitlements } from "@/server/entitlements"
import { TEMPLATE_MAP } from "@/lib/data/templates"

/**
 * Who can open a template.
 *
 * Two routes in: a paid plan covers the whole library, or the template was
 * bought outright. A one-off purchase is permanent and survives the plan
 * lapsing — somebody who paid for a thing owns that thing.
 */

export type TemplateAccess = "included" | "purchased" | "free" | "locked"

export interface TemplateStatus {
  access: TemplateAccess
  /** cents; 0 when the template is free */
  price: number
  canOpen: boolean
}

/** Plans that carry the whole template library. */
function planIncludesTemplates(plan: string): boolean {
  return plan !== "free"
}

export async function listOwnedSlugs(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ slug: schema.templatePurchase.templateSlug })
    .from(schema.templatePurchase)
    .where(eq(schema.templatePurchase.userId, userId))

  return new Set(rows.map((row) => row.slug))
}

export async function ownsTemplate(userId: string, slug: string): Promise<boolean> {
  const [row] = await db
    .select({ id: schema.templatePurchase.id })
    .from(schema.templatePurchase)
    .where(
      and(
        eq(schema.templatePurchase.userId, userId),
        eq(schema.templatePurchase.templateSlug, slug)
      )
    )
    .limit(1)

  return Boolean(row)
}

export async function getTemplateStatus(slug: string): Promise<TemplateStatus> {
  const template = TEMPLATE_MAP.get(slug)
  const price = template?.price ?? 0

  if (price === 0) return { access: "free", price: 0, canOpen: true }

  const entitlements = await getEntitlements()
  if (!entitlements.signedIn) return { access: "locked", price, canOpen: false }

  if (planIncludesTemplates(entitlements.plan.id)) {
    return { access: "included", price, canOpen: true }
  }

  const { getCurrentUser } = await import("@/server/session")
  const user = await getCurrentUser()
  if (user && (await ownsTemplate(user.id, slug))) {
    return { access: "purchased", price, canOpen: true }
  }

  return { access: "locked", price, canOpen: false }
}

/** Status for a whole listing, in two queries rather than one per row. */
export async function getTemplateStatuses(slugs: string[]): Promise<Map<string, TemplateAccess>> {
  const out = new Map<string, TemplateAccess>()
  const entitlements = await getEntitlements()

  const paid = slugs.filter((slug) => (TEMPLATE_MAP.get(slug)?.price ?? 0) > 0)
  for (const slug of slugs) {
    if (!paid.includes(slug)) out.set(slug, "free")
  }

  if (paid.length === 0) return out

  if (entitlements.signedIn && planIncludesTemplates(entitlements.plan.id)) {
    for (const slug of paid) out.set(slug, "included")
    return out
  }

  let owned = new Set<string>()
  if (entitlements.signedIn) {
    const { getCurrentUser } = await import("@/server/session")
    const user = await getCurrentUser()
    if (user) {
      const rows = await db
        .select({ slug: schema.templatePurchase.templateSlug })
        .from(schema.templatePurchase)
        .where(
          and(
            eq(schema.templatePurchase.userId, user.id),
            inArray(schema.templatePurchase.templateSlug, paid)
          )
        )
      owned = new Set(rows.map((row) => row.slug))
    }
  }

  for (const slug of paid) out.set(slug, owned.has(slug) ? "purchased" : "locked")
  return out
}
