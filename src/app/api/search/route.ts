import { NextResponse } from "next/server"
import { queryComponents, rankedAuthors, rankedLibraries, componentHref } from "@/lib/queries"
import { getAuthor } from "@/lib/data/authors"
import { TAGS } from "@/lib/data/tags"

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().toLowerCase()

  const components = queryComponents({ q, sort: "popular", limit: 8 }).map((c) => ({
    id: c.id,
    name: c.name,
    href: componentHref(c),
    author: getAuthor(c.authorHandle).name,
    previewKey: c.previewKey,
    bookmarks: c.bookmarks,
  }))

  const authors = (q
    ? rankedAuthors().filter(
        (a) => a.name.toLowerCase().includes(q) || a.handle.includes(q)
      )
    : rankedAuthors()
  )
    .slice(0, 4)
    .map((a) => ({ handle: a.handle, name: a.name, href: `/@${a.handle}`, count: a.componentCount }))

  const libraries = (q
    ? rankedLibraries().filter((l) => l.name.toLowerCase().includes(q))
    : rankedLibraries()
  )
    .slice(0, 4)
    .map((l) => ({
      slug: l.slug,
      name: l.name,
      href: `/@${l.authorHandle}/library/${l.slug}`,
      count: l.componentCount,
    }))

  const tags = (q ? TAGS.filter((t) => t.name.toLowerCase().includes(q)) : TAGS.slice(0, 6))
    .slice(0, 6)
    .map((t) => ({
      slug: t.slug,
      name: t.name,
      href: t.href ?? `/community/components/s/${t.slug}`,
      count: t.count,
    }))

  return NextResponse.json({ components, authors, libraries, tags })
}
