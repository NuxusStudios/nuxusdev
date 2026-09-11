import "server-only"
import { and, desc, eq, inArray } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { COMPONENTS, COMPONENT_MAP } from "@/lib/data/components"
import type { ComponentRecord } from "@/lib/types"

/**
 * Read layer over the whole catalogue: the static registry shipped with the app
 * plus components published by users. Static ids are checked first because they
 * are in memory; only then do we touch the database.
 */

const STATIC_IDS = new Set(COMPONENTS.map((c) => c.id))

/** Maps a published row onto the same shape the UI already renders. */
export function toRecord(row: typeof schema.component.$inferSelect, authorHandle: string): ComponentRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    authorHandle,
    tags: row.tags,
    previewKey: "", // user components render from stored source, not the bundled registry
    fileName: row.fileName,
    demoFileName: row.demoFileName,
    dependencies: row.dependencies,
    license: row.license,
    source: row.sourceUrl ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    bookmarks: row.bookmarkCount,
    views: row.viewCount,
    installs: 0,
    previewBg: "dark",
  }
}

export async function componentExists(id: string): Promise<boolean> {
  if (STATIC_IDS.has(id)) return true

  const [row] = await db
    .select({ id: schema.component.id })
    .from(schema.component)
    .where(and(eq(schema.component.id, id), eq(schema.component.status, "published")))
    .limit(1)

  return Boolean(row)
}

/** Resolves a mixed list of ids to records, preserving the requested order. */
export async function resolveComponents(ids: string[]): Promise<ComponentRecord[]> {
  if (ids.length === 0) return []

  const found = new Map<string, ComponentRecord>()
  const missing: string[] = []

  for (const id of ids) {
    const staticRecord = COMPONENT_MAP.get(id)
    if (staticRecord) found.set(id, staticRecord)
    else missing.push(id)
  }

  if (missing.length > 0) {
    const rows = await db
      .select({ component: schema.component, handle: schema.user.handle })
      .from(schema.component)
      .innerJoin(schema.user, eq(schema.user.id, schema.component.authorId))
      .where(
        and(inArray(schema.component.id, missing), eq(schema.component.status, "published"))
      )

    for (const row of rows) {
      found.set(row.component.id, toRecord(row.component, row.handle ?? "unknown"))
    }
  }

  return ids.map((id) => found.get(id)).filter((c): c is ComponentRecord => Boolean(c))
}

/** Components a given user has published, newest first. */
export async function listPublishedByAuthor(
  authorId: string,
  { includeDrafts = false }: { includeDrafts?: boolean } = {}
): Promise<ComponentRecord[]> {
  const rows = await db
    .select({ component: schema.component, handle: schema.user.handle })
    .from(schema.component)
    .innerJoin(schema.user, eq(schema.user.id, schema.component.authorId))
    .where(
      includeDrafts
        ? eq(schema.component.authorId, authorId)
        : and(
            eq(schema.component.authorId, authorId),
            eq(schema.component.status, "published")
          )
    )
    .orderBy(desc(schema.component.createdAt))

  return rows.map((row) => toRecord(row.component, row.handle ?? "unknown"))
}
