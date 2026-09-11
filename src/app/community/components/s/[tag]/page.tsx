import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { LoadMoreGrid } from "@/components/site/load-more-grid"
import { SortTabs } from "@/components/site/sort-tabs"
import { TAG_MAP, TAGS } from "@/lib/data/tags"
import { queryComponents, type SortKey } from "@/lib/queries"
import { formatNumber } from "@/lib/utils"

export function generateStaticParams() {
  return TAGS.filter((t) => !t.href).map((t) => ({ tag: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>
}): Promise<Metadata> {
  const { tag } = await params
  const meta = TAG_MAP.get(tag)
  return {
    title: meta ? `${meta.name} — React components` : "Components",
    description: meta
      ? `${formatNumber(meta.count)} ${meta.name.toLowerCase()} built with React and Tailwind, each with a live preview and a copyable prompt.`
      : undefined,
  }
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>
  searchParams: Promise<{ sort?: string }>
}) {
  const { tag } = await params
  const { sort } = await searchParams
  const meta = TAG_MAP.get(tag)
  if (!meta) notFound()

  const sortKey = (["featured", "newest", "popular", "installs"].includes(sort ?? "")
    ? sort
    : "featured") as SortKey

  const components = queryComponents({ tag, sort: sortKey })

  return (
    <>
      <CommunityTopBar
        breadcrumb={[
          { label: "Components", href: "/community/components/featured" },
          { label: meta.name },
        ]}
      />

      <div className="px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{meta.name}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {formatNumber(meta.count)} components in this category ·{" "}
              {components.length} with live previews
            </p>
          </div>
          <SortTabs basePath={`/community/components/s/${tag}`} active={sortKey} />
        </div>

        <div className="mt-8">
          {components.length ? (
            <LoadMoreGrid components={components} />
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-8 py-20 text-center">
              <p className="text-sm font-medium">Nothing published here yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Be the first to publish a {meta.name.toLowerCase().replace(/s$/, "")} component.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
