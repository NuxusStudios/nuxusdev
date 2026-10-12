"use server"

import { and, asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db, schema } from "@/server/db"
import { requireAdmin } from "@/server/session"
import { run, ValidationError } from "@/server/actions/result"

/**
 * The review queue: the only place a component becomes publicly readable.
 *
 * Every function here goes through `requireAdmin` first, before reading
 * anything. Fetching the row and then checking who is asking is the same code
 * with a window in it — and the window is where a missing `return` becomes a
 * data leak.
 */

const decisionSchema = z.object({
  componentId: z.string().trim().min(1).max(64),
  note: z.string().trim().max(600).optional(),
})

/** One pending submission, with enough to judge it without another query. */
export interface PendingSubmission {
  id: string
  slug: string
  name: string
  description: string
  code: string
  demoCode: string
  tags: string[]
  dependencies: string[]
  license: string
  sourceUrl: string | null
  createdAt: Date
  authorId: string
  authorName: string | null
  authorHandle: string | null
  authorEmail: string
  /**
   * Whole days this has been waiting, measured server-side.
   *
   * Not computed in the component: `Date.now()` during render is impure, and
   * the compiler is right to refuse it — two renders would disagree. The
   * server renders this page fresh on every visit, so the number is current.
   */
  waitingDays: number
}

export async function listPendingSubmissions() {
  return run(async () => {
    await requireAdmin()

    const rows = await db
      .select({
        id: schema.component.id,
        slug: schema.component.slug,
        name: schema.component.name,
        description: schema.component.description,
        code: schema.component.code,
        demoCode: schema.component.demoCode,
        tags: schema.component.tags,
        dependencies: schema.component.dependencies,
        license: schema.component.license,
        sourceUrl: schema.component.sourceUrl,
        createdAt: schema.component.createdAt,
        authorId: schema.user.id,
        authorName: schema.user.name,
        authorHandle: schema.user.handle,
        authorEmail: schema.user.email,
      })
      .from(schema.component)
      .innerJoin(schema.user, eq(schema.component.authorId, schema.user.id))
      .where(eq(schema.component.status, "pending"))
      // Oldest first: a queue that serves the newest submission first leaves
      // the unlucky waiting forever.
      .orderBy(asc(schema.component.createdAt))
      .limit(100)

    const now = Date.now()
    return rows.map((row) => ({
      ...row,
      waitingDays: Math.max(
        0,
        Math.floor((now - new Date(row.createdAt).getTime()) / 86_400_000)
      ),
    })) as PendingSubmission[]
  })
}

export async function approveSubmission(input: z.input<typeof decisionSchema>) {
  return run(async () => {
    const reviewer = await requireAdmin()
    const parsed = decisionSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError("That submission doesn't exist")

    const [row] = await db
      .select({ authorId: schema.component.authorId, slug: schema.component.slug })
      .from(schema.component)
      .where(
        and(
          eq(schema.component.id, parsed.data.componentId),
          // Only a pending row can be approved. Without this, a replayed click
          // could revive something that was rejected or unpublished since.
          eq(schema.component.status, "pending")
        )
      )
      .limit(1)

    if (!row) throw new ValidationError("That submission is no longer pending")

    await db
      .update(schema.component)
      .set({
        status: "published",
        reviewedAt: new Date(),
        reviewedBy: reviewer.id,
        reviewNote: parsed.data.note ?? null,
        updatedAt: new Date(),
      })
      .where(eq(schema.component.id, parsed.data.componentId))

    const [author] = await db
      .select({ handle: schema.user.handle })
      .from(schema.user)
      .where(eq(schema.user.id, row.authorId))
      .limit(1)

    // Now it is public, so the listings that hide pending rows are stale.
    revalidatePath("/community/components/newest")
    revalidatePath("/community/components/featured")
    if (author?.handle) revalidatePath(`/@${author.handle}`)
    revalidatePath("/admin/review")

    return { slug: row.slug, handle: author?.handle ?? null }
  })
}

export async function rejectSubmission(input: z.input<typeof decisionSchema>) {
  return run(async () => {
    const reviewer = await requireAdmin()
    const parsed = decisionSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError("That submission doesn't exist")

    // A decline with no reason teaches the author nothing and guarantees they
    // resubmit the same thing.
    if (!parsed.data.note) {
      throw new ValidationError("Give a reason — the author sees it.")
    }

    const [row] = await db
      .select({ authorId: schema.component.authorId })
      .from(schema.component)
      .where(
        and(
          eq(schema.component.id, parsed.data.componentId),
          eq(schema.component.status, "pending")
        )
      )
      .limit(1)

    if (!row) throw new ValidationError("That submission is no longer pending")

    await db
      .update(schema.component)
      .set({
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: reviewer.id,
        reviewNote: parsed.data.note,
        updatedAt: new Date(),
      })
      .where(eq(schema.component.id, parsed.data.componentId))

    const [author] = await db
      .select({ handle: schema.user.handle })
      .from(schema.user)
      .where(eq(schema.user.id, row.authorId))
      .limit(1)

    if (author?.handle) revalidatePath(`/@${author.handle}`)
    revalidatePath("/admin/review")
  })
}
