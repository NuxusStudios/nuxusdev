import { COMPONENTS } from "@/lib/data/components"
import { AUTHORS, getAuthor } from "@/lib/data/authors"
import { LIBRARIES, LIBRARY_MAP } from "@/lib/data/libraries"
import { TAGS } from "@/lib/data/tags"
import type { Author, ComponentRecord, Library } from "@/lib/types"

export type SortKey = "featured" | "newest" | "popular" | "installs" | "updated"

export interface ComponentQuery {
  tag?: string
  author?: string
  library?: string
  q?: string
  sort?: SortKey
  limit?: number
  offset?: number
  excludeId?: string
}

function score(c: ComponentRecord, sort: SortKey): number {
  switch (sort) {
    case "newest":
    case "updated":
      return new Date(c.updatedAt ?? c.createdAt).getTime()
    case "installs":
      return c.installs
    case "popular":
      return c.bookmarks
    case "featured":
    default:
      return (c.featured ? 1_000_000 : 0) + c.bookmarks
  }
}

export function queryComponents(query: ComponentQuery = {}): ComponentRecord[] {
  const { tag, author, library, q, sort = "featured", limit, offset = 0, excludeId } = query

  let rows = COMPONENTS.slice()

  if (tag) rows = rows.filter((c) => c.tags.includes(tag))
  if (author) rows = rows.filter((c) => c.authorHandle === author)
  if (library) rows = rows.filter((c) => c.librarySlug === library)
  if (excludeId) rows = rows.filter((c) => c.id !== excludeId)

  if (q) {
    const needle = q.toLowerCase().trim()
    rows = rows.filter((c) => {
      const author = getAuthor(c.authorHandle)
      return (
        c.name.toLowerCase().includes(needle) ||
        c.description.toLowerCase().includes(needle) ||
        c.slug.includes(needle) ||
        c.tags.some((t) => t.includes(needle)) ||
        author.name.toLowerCase().includes(needle) ||
        author.handle.includes(needle)
      )
    })
  }

  rows.sort((a, b) => score(b, sort) - score(a, sort))

  return typeof limit === "number" ? rows.slice(offset, offset + limit) : rows.slice(offset)
}

export function countComponents(query: ComponentQuery = {}): number {
  return queryComponents({ ...query, limit: undefined, offset: 0 }).length
}

export function getComponent(handle: string, slug: string): ComponentRecord | undefined {
  return COMPONENTS.find((c) => c.authorHandle === handle && c.slug === slug)
}

export function getComponentBySlug(slug: string): ComponentRecord | undefined {
  return COMPONENTS.find((c) => c.slug === slug)
}

export function componentHref(c: ComponentRecord): string {
  return `/@${c.authorHandle}/components/${c.slug}`
}

export function similarComponents(c: ComponentRecord, limit = 6): ComponentRecord[] {
  const scored = COMPONENTS.filter((o) => o.id !== c.id).map((o) => ({
    c: o,
    overlap: o.tags.filter((t) => c.tags.includes(t)).length +
      (o.librarySlug && o.librarySlug === c.librarySlug ? 1.5 : 0),
  }))
  return scored
    .filter((s) => s.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.c.bookmarks - a.c.bookmarks)
    .slice(0, limit)
    .map((s) => s.c)
}

/** Authors ranked by bookmarks across the components they published. */
export function rankedAuthors(): (Author & { bookmarks: number; published: number })[] {
  return AUTHORS.map((a) => {
    const own = COMPONENTS.filter((c) => c.authorHandle === a.handle)
    return {
      ...a,
      bookmarks: own.reduce((sum, c) => sum + c.bookmarks, 0),
      published: own.length,
    }
  }).sort((a, b) => b.bookmarks - a.bookmarks || b.componentCount - a.componentCount)
}

export function rankedLibraries(): (Library & { bookmarks: number })[] {
  return LIBRARIES.map((l) => ({
    ...l,
    bookmarks: COMPONENTS.filter((c) => c.librarySlug === l.slug).reduce((s, c) => s + c.bookmarks, 0),
  })).sort((a, b) => b.componentCount - a.componentCount)
}

export function getLibrary(slug: string): Library | undefined {
  return LIBRARY_MAP.get(slug)
}

/** Tags that actually have components behind them, most populated first. */
export function activeTags() {
  return TAGS.map((t) => ({ ...t, live: countComponents({ tag: t.slug }) }))
    .filter((t) => t.live > 0)
    .sort((a, b) => b.live - a.live)
}

export const TOTAL_COMPONENTS = COMPONENTS.length
