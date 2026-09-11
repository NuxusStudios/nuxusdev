import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { ComponentGrid } from "@/components/site/component-grid"
import { Button } from "@/components/ui/button"
import { LIBRARIES, LIBRARY_MAP } from "@/lib/data/libraries"
import { getAuthor } from "@/lib/data/authors"
import { queryComponents } from "@/lib/queries"
import { formatCount, formatNumber } from "@/lib/utils"

export function generateStaticParams() {
  return LIBRARIES.map((l) => ({ handle: `@${l.authorHandle}`, slug: l.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const library = LIBRARY_MAP.get(slug)
  if (!library) return {}
  return { title: `${library.name} — component library`, description: library.description }
}

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>
}) {
  const { slug } = await params
  const library = LIBRARY_MAP.get(slug)
  if (!library) notFound()

  const author = getAuthor(library.authorHandle)
  const components = queryComponents({ library: slug, sort: "popular" })
  const bookmarks = components.reduce((s, c) => s + c.bookmarks, 0)

  return (
    <div className="min-h-screen">
      <CommunityTopBar
        breadcrumb={[
          { label: "Libraries", href: "/community/libraries" },
          { label: library.name },
        ]}
      />

      <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-start gap-5">
          <span
            className="flex size-16 items-center justify-center rounded-2xl text-2xl font-bold text-white"
            style={{ backgroundColor: library.accent ?? "#3f3f46" }}
          >
            {library.name.slice(0, 1)}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight">{library.name}</h1>
            <p className="mt-1.5 max-w-2xl text-[15px] text-muted-foreground">
              {library.description}
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              by{" "}
              <Link href={`/@${author.handle}`} className="text-foreground transition-colors hover:underline">
                {author.name}
              </Link>{" "}
              · {formatNumber(library.componentCount)} components ·{" "}
              {formatCount(bookmarks)} bookmarks
            </p>
          </div>

          {library.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={`https://${library.website}`} target="_blank" rel="noreferrer noopener">
                {library.website}
                <ArrowUpRight className="size-3.5" />
              </a>
            </Button>
          )}
        </div>

        <div className="mt-10">
          {components.length ? (
            <ComponentGrid components={components} />
          ) : (
            <p className="rounded-2xl border border-dashed border-border px-8 py-16 text-center text-sm text-muted-foreground">
              Nothing published from this library yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
