"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db, schema } from "@/server/db"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import { TAG_MAP } from "@/lib/data/tags"

/**
 * Publishing stores source code submitted by users.
 *
 * That code is NEVER executed — not on the server, not in the browser. It is
 * stored as text and only ever rendered through Shiki, which escapes it. Live
 * previews for user-published components would need a bundler running inside a
 * sandboxed, separate origin; until that exists these components show source
 * and a prompt, and the preview frame stays empty.
 */

const MAX_CODE_BYTES = 128 * 1024

const LICENSES = ["MIT License", "Apache 2.0", "GPL-3.0", "All rights reserved"] as const

const publishSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(60),
  description: z.string().trim().min(10, "Write at least a sentence").max(280),
  code: z
    .string()
    .min(20, "That doesn't look like a component")
    .refine((value) => Buffer.byteLength(value, "utf8") <= MAX_CODE_BYTES, "Component file is too large"),
  demoCode: z
    .string()
    .min(10, "Add a demo that renders your component")
    .refine((value) => Buffer.byteLength(value, "utf8") <= MAX_CODE_BYTES, "Demo file is too large"),
  tags: z
    .array(z.string())
    .min(1, "Pick at least one category")
    .max(5, "Pick at most five categories")
    .refine((tags) => tags.every((tag) => TAG_MAP.has(tag)), "Unknown category"),
  dependencies: z.array(z.string().regex(/^[@a-z0-9][\w./-]*$/i, "Invalid package name")).max(20),
  license: z.enum(LICENSES),
  sourceUrl: z
    .union([z.string().url("Source must be a URL"), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  status: z.enum(["draft", "published"]).default("published"),
})

export type PublishInput = z.input<typeof publishSchema>

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "component"
  )
}

export async function publishComponent(input: PublishInput) {
  return run(async () => {
    const user = await requireUser()

    if (!user.emailVerified) {
      throw new ValidationError("Verify your email address before publishing.")
    }

    enforceRateLimit(`publish:${user.id}`, { max: 20, windowSeconds: 3600 })

    const parsed = publishSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0].message)
    const data = parsed.data

    // sourceUrl is rendered as a link, so only allow http(s)
    if (data.sourceUrl) {
      const protocol = new URL(data.sourceUrl).protocol
      if (protocol !== "https:" && protocol !== "http:") {
        throw new ValidationError("Source must be an http(s) URL")
      }
    }

    const base = slugify(data.name)
    const taken = new Set(
      (
        await db
          .select({ slug: schema.component.slug })
          .from(schema.component)
          .where(eq(schema.component.authorId, user.id))
      ).map((row) => row.slug)
    )

    let slug = base
    let suffix = 2
    while (taken.has(slug)) slug = `${base}-${suffix++}`

    const id = `pub_${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`

    await db.insert(schema.component).values({
      id,
      authorId: user.id,
      slug,
      name: data.name,
      description: data.description,
      code: data.code,
      demoCode: data.demoCode,
      fileName: `${slug}.tsx`,
      demoFileName: `${slug}-demo.tsx`,
      tags: data.tags,
      dependencies: data.dependencies,
      license: data.license,
      sourceUrl: data.sourceUrl ?? null,
      status: data.status,
    })

    revalidatePath("/community/components/newest")
    revalidatePath(`/@${user.handle ?? ""}`)

    return { id, slug, handle: user.handle, status: data.status }
  })
}

export async function unpublishComponent(componentId: string) {
  return run(async () => {
    const user = await requireUser()

    const [row] = await db
      .select({ id: schema.component.id })
      .from(schema.component)
      .where(
        and(eq(schema.component.id, componentId), eq(schema.component.authorId, user.id))
      )
      .limit(1)

    if (!row) throw new ValidationError("That component doesn't exist")

    await db
      .update(schema.component)
      .set({ status: "unlisted", updatedAt: new Date() })
      .where(and(eq(schema.component.id, componentId), eq(schema.component.authorId, user.id)))

    revalidatePath(`/@${user.handle ?? ""}`)
  })
}
