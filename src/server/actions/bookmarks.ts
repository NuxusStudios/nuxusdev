"use server"

import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db, schema } from "@/server/db"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import { componentExists } from "@/server/catalogue"

const componentIdSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9._-]+$/, "Invalid component id")

/** Adds or removes a bookmark. Returns the resulting state. */
export async function toggleBookmark(rawComponentId: string) {
  return run(async () => {
    const user = await requireUser()
    enforceRateLimit(`bookmark:${user.id}`, { max: 120, windowSeconds: 60 })

    const parsed = componentIdSchema.safeParse(rawComponentId)
    if (!parsed.success) throw new ValidationError("Invalid component id")
    const componentId = parsed.data

    if (!(await componentExists(componentId))) {
      throw new ValidationError("That component doesn't exist")
    }

    const [existing] = await db
      .select({ componentId: schema.bookmark.componentId })
      .from(schema.bookmark)
      .where(
        and(eq(schema.bookmark.userId, user.id), eq(schema.bookmark.componentId, componentId))
      )
      .limit(1)

    if (existing) {
      await db
        .delete(schema.bookmark)
        .where(
          and(eq(schema.bookmark.userId, user.id), eq(schema.bookmark.componentId, componentId))
        )

      // keep the denormalised count on user-published rows in step
      await db
        .update(schema.component)
        .set({ bookmarkCount: sql`greatest(${schema.component.bookmarkCount} - 1, 0)` })
        .where(eq(schema.component.id, componentId))

      revalidatePath("/bookmarks")
      return { bookmarked: false }
    }

    await db
      .insert(schema.bookmark)
      .values({ userId: user.id, componentId })
      // MySQL has no DO NOTHING; setting a key column to itself is the no-op
      .onDuplicateKeyUpdate({ set: { componentId: sql`component_id` } })

    await db
      .update(schema.component)
      .set({ bookmarkCount: sql`${schema.component.bookmarkCount} + 1` })
      .where(eq(schema.component.id, componentId))

    // also drop it into the default collection so /bookmarks isn't empty
    const [defaultCollection] = await db
      .select({ id: schema.collection.id })
      .from(schema.collection)
      .where(and(eq(schema.collection.userId, user.id), eq(schema.collection.isDefault, true)))
      .limit(1)

    if (defaultCollection) {
      await db
        .insert(schema.collectionItem)
        .values({ collectionId: defaultCollection.id, componentId })
        .onDuplicateKeyUpdate({ set: { componentId: sql`component_id` } })
    }

    revalidatePath("/bookmarks")
    return { bookmarked: true }
  })
}

/** The ids the signed-in user has bookmarked, for hydrating the grid. */
export async function listBookmarkedIds() {
  return run(async () => {
    const user = await requireUser()
    const rows = await db
      .select({ componentId: schema.bookmark.componentId })
      .from(schema.bookmark)
      .where(eq(schema.bookmark.userId, user.id))
    return rows.map((row) => row.componentId)
  })
}
