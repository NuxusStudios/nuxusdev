import { NextResponse } from "next/server"
import { renderIcon, searchIcons } from "@/server/icons"

/**
 * Icon search and SVG rendering.
 *
 *   /api/icons?q=home&set=tabler     search
 *   /api/icons?id=tabler:home        one icon's SVG
 *
 * Public and read-only — icons are open-source assets, not gated content. The
 * copy action on the client is what checks the plan.
 */
export const runtime = "nodejs"

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams

  const id = params.get("id")
  if (id) {
    if (!/^[a-z0-9-]+:[a-z0-9-]+$/i.test(id)) {
      return NextResponse.json({ error: "Invalid icon id" }, { status: 400 })
    }

    const size = Math.min(Math.max(Number(params.get("size")) || 24, 8), 512)
    const svg = await renderIcon(id, size)

    if (!svg) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return new NextResponse(svg, {
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        // open-source assets that never change under a given id
        "cache-control": "public, max-age=31536000, immutable",
      },
    })
  }

  const query = (params.get("q") ?? "").slice(0, 60)
  const set = params.get("set") ?? undefined
  const offset = Math.max(Number(params.get("offset")) || 0, 0)
  const limit = Math.min(Math.max(Number(params.get("limit")) || 120, 1), 200)

  const { hits, total } = searchIcons(query, { set, limit, offset })

  return NextResponse.json(
    { hits, total, offset, limit },
    { headers: { "cache-control": "public, max-age=300" } }
  )
}
