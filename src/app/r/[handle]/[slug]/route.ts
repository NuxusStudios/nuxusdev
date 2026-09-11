import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { COMPONENTS } from "@/lib/data/components"
import { readComponentSource, readDemoSource } from "@/lib/source"
import { tokenFromRequest, verifyToken } from "@/server/tokens"
import { enforceRateLimit, RateLimitError } from "@/server/rate-limit"
import { BRAND } from "@/lib/brand"

/**
 * shadcn-compatible registry endpoint.
 *
 *   npx shadcn@latest add "https://nuxus.dev/r/<handle>/<slug>?token=nxs_..."
 *
 * This serves component source, so it is behind the same plan check as copying
 * from the site. A terminal has no session cookie, so it authenticates with a
 * personal access token instead — created in Settings.
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string; slug: string }> }
) {
  const { handle: rawHandle, slug } = await params
  const handle = decodeURIComponent(rawHandle).replace(/^@/, "")

  const bearer = await verifyToken(tokenFromRequest(request))

  if (!bearer) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        detail:
          `This registry needs a personal access token. Create one at https://${BRAND.domain}/settings ` +
          `and append ?token=… to the URL, or send it as a Bearer header.`,
      },
      { status: 401, headers: { "www-authenticate": 'Bearer realm="nuxus-registry"' } }
    )
  }

  try {
    enforceRateLimit(`registry:${bearer.userId}`, { max: 120, windowSeconds: 60 })
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: "Too many requests", retryAfter: error.retryAfterSeconds },
        { status: 429, headers: { "retry-after": String(error.retryAfterSeconds) } }
      )
    }
    throw error
  }

  if (!bearer.canCopy) {
    return NextResponse.json(
      {
        error: "Payment required",
        detail: `Installing components requires a plan. See https://${BRAND.domain}/pricing`,
      },
      { status: 402 }
    )
  }

  const item = await buildRegistryItem(handle, slug)
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(item, {
    headers: { "cache-control": "private, no-store" },
  })
}

/** The shape `npx shadcn add` expects. */
async function buildRegistryItem(handle: string, slug: string) {
  const staticRecord = COMPONENTS.find((c) => c.authorHandle === handle && c.slug === slug)

  if (staticRecord) {
    const [code, demo] = await Promise.all([
      readComponentSource(staticRecord.previewKey),
      readDemoSource(staticRecord.previewKey),
    ])

    return {
      $schema: "https://ui.shadcn.com/schema/registry-item.json",
      name: staticRecord.slug,
      type: "registry:ui",
      title: staticRecord.name,
      description: staticRecord.description,
      author: `@${staticRecord.authorHandle}`,
      dependencies: staticRecord.dependencies.filter(
        (dep) => dep !== "react" && dep !== "react-dom" && dep !== "next"
      ),
      registryDependencies: staticRecord.registryDependencies ?? [],
      files: [
        {
          path: `components/ui/${staticRecord.fileName}`,
          target: `components/ui/${staticRecord.fileName}`,
          type: "registry:ui",
          content: code,
        },
        {
          path: `components/${staticRecord.demoFileName}`,
          target: `components/${staticRecord.demoFileName}`,
          type: "registry:component",
          content: demo,
        },
      ],
      meta: { license: staticRecord.license, source: staticRecord.source ?? null },
    }
  }

  // components published by users live in the database
  const [row] = await db
    .select({ component: schema.component, handle: schema.user.handle })
    .from(schema.component)
    .innerJoin(schema.user, eq(schema.user.id, schema.component.authorId))
    .where(
      and(
        eq(schema.user.handle, handle),
        eq(schema.component.slug, slug),
        eq(schema.component.status, "published")
      )
    )
    .limit(1)

  if (!row) return null

  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: row.component.slug,
    type: "registry:ui",
    title: row.component.name,
    description: row.component.description,
    author: `@${row.handle}`,
    dependencies: row.component.dependencies,
    registryDependencies: [],
    files: [
      {
        path: `components/ui/${row.component.fileName}`,
        target: `components/ui/${row.component.fileName}`,
        type: "registry:ui",
        content: row.component.code,
      },
      {
        path: `components/${row.component.demoFileName}`,
        target: `components/${row.component.demoFileName}`,
        type: "registry:component",
        content: row.component.demoCode,
      },
    ],
    meta: { license: row.component.license, source: row.component.sourceUrl },
  }
}
