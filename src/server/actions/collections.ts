"use server"

import { and, asc, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db, schema } from "@/server/db"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import { componentExists, resolveComponents } from "@/server/catalogue"

const MAX_COLLECTIONS = 50
const MAX_ITEMS_PER_COLLECTION = 500

const nameSchema = z
  .string()
  .trim()
  .min(1, "Give the list a name")
  .max(60, "Keep the name under 60 characters")

const idSchema = z.string().uuid("Invalid list")
const componentIdSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-zA-Z0-9._-]+$/, "Invalid component id")

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "list"
  )
}

/** Every collection query is scoped by userId — that is the authorisation. */
async function ownedCollection(userId: string, collectionId: string) {
  const [row] = await db
    .select()
    .from(schema.collection)
    .where(and(eq(schema.collection.id, collectionId), eq(schema.collection.userId, userId)))
    .limit(1)

  if (!row) throw new ValidationError("That list doesn't exist")
  return row
}

export async function createCollection(rawName: string) {
  return run(async () => {
    const user = await requireUser()
    enforceRateLimit(`collection:create:${user.id}`, { max: 20, windowSeconds: 3600 })

    const parsed = nameSchema.safeParse(rawName)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0].message)

    const existing = await db
      .select({ id: schema.collection.id })
      .from(schema.collection)
      .where(eq(schema.collection.userId, user.id))

    if (existing.length >= MAX_COLLECTIONS) {
      throw new ValidationError(`You can have at most ${MAX_COLLECTIONS} lists`)
    }

    const base = slugify(parsed.data)
    const taken = new Set(
      (
        await db
          .select({ slug: schema.collection.slug })
          .from(schema.collection)
          .where(eq(schema.collection.userId, user.id))
      ).map((row) => row.slug)
    )

    let slug = base
    let suffix = 2
    while (taken.has(slug)) slug = `${base}-${suffix++}`

    const id = crypto.randomUUID()
    await db.insert(schema.collection).values({ id, userId: user.id, name: parsed.data, slug })

    revalidatePath("/bookmarks")
    return { id, name: parsed.data, slug }
  })
}

export async function renameCollection(rawId: string, rawName: string) {
  return run(async () => {
    const user = await requireUser()
    enforceRateLimit(`collection:rename:${user.id}`, { max: 60, windowSeconds: 3600 })

    const id = idSchema.parse(rawId)
    const parsed = nameSchema.safeParse(rawName)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0].message)

    await ownedCollection(user.id, id)

    await db
      .update(schema.collection)
      .set({ name: parsed.data, updatedAt: new Date() })
      .where(and(eq(schema.collection.id, id), eq(schema.collection.userId, user.id)))

    revalidatePath("/bookmarks")
  })
}

export async function deleteCollection(rawId: string) {
  return run(async () => {
    const user = await requireUser()
    const id = idSchema.parse(rawId)

    const collection = await ownedCollection(user.id, id)
    if (collection.isDefault) throw new ValidationError("The default list can't be deleted")

    await db
      .delete(schema.collection)
      .where(and(eq(schema.collection.id, id), eq(schema.collection.userId, user.id)))

    revalidatePath("/bookmarks")
  })
}

export async function setCollectionItem(
  rawCollectionId: string,
  rawComponentId: string,
  present: boolean
) {
  return run(async () => {
    const user = await requireUser()
    enforceRateLimit(`collection:item:${user.id}`, { max: 200, windowSeconds: 60 })

    const collectionId = idSchema.parse(rawCollectionId)
    const parsed = componentIdSchema.safeParse(rawComponentId)
    if (!parsed.success) throw new ValidationError("Invalid component id")
    const componentId = parsed.data

    await ownedCollection(user.id, collectionId)

    if (!present) {
      await db
        .delete(schema.collectionItem)
        .where(
          and(
            eq(schema.collectionItem.collectionId, collectionId),
            eq(schema.collectionItem.componentId, componentId)
          )
        )
      revalidatePath("/bookmarks")
      return { present: false }
    }

    if (!(await componentExists(componentId))) {
      throw new ValidationError("That component doesn't exist")
    }

    const items = await db
      .select({ componentId: schema.collectionItem.componentId })
      .from(schema.collectionItem)
      .where(eq(schema.collectionItem.collectionId, collectionId))

    if (items.length >= MAX_ITEMS_PER_COLLECTION) {
      throw new ValidationError(`A list can hold at most ${MAX_ITEMS_PER_COLLECTION} components`)
    }

    await db
      .insert(schema.collectionItem)
      .values({ collectionId, componentId })
      // MySQL has no DO NOTHING; setting a key column to itself is the no-op
      .onDuplicateKeyUpdate({ set: { componentId: sql`component_id` } })

    revalidatePath("/bookmarks")
    return { present: true }
  })
}

/** Reads the signed-in user's lists with their components resolved. */
export async function listCollections() {
  const user = await requireUser()

  const collections = await db
    .select()
    .from(schema.collection)
    .where(eq(schema.collection.userId, user.id))
    .orderBy(asc(schema.collection.createdAt))

  const items = await db
    .select({
      collectionId: schema.collectionItem.collectionId,
      componentId: schema.collectionItem.componentId,
    })
    .from(schema.collectionItem)
    .innerJoin(schema.collection, eq(schema.collection.id, schema.collectionItem.collectionId))
    .where(eq(schema.collection.userId, user.id))

  const allIds = [...new Set(items.map((item) => item.componentId))]
  const records = await resolveComponents(allIds)
  const byId = new Map(records.map((record) => [record.id, record]))

  return collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    isDefault: collection.isDefault,
    components: items
      .filter((item) => item.collectionId === collection.id)
      .map((item) => byId.get(item.componentId))
      .filter((c): c is NonNullable<typeof c> => Boolean(c)),
  }))
}
