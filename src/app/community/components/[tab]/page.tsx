import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { SectionRow } from "@/components/site/section-row"
import { LoadMoreGrid } from "@/components/site/load-more-grid"
import { queryComponents } from "@/lib/queries"

const TABS = ["featured", "newest", "updated"] as const
type Tab = (typeof TABS)[number]

export function generateStaticParams() {
  return TABS.map((tab) => ({ tab }))
}

export const metadata: Metadata = {
  title: "Discover community-made UI components",
  description:
    "Browse thousands of React components published by design engineers — with live previews, real source, and a prompt for every one.",
}

const ROWS: { title: string; tag: string }[] = [
  { title: "Shaders", tag: "shaders" },
  { title: "Heros", tag: "hero" },
  { title: "Features", tag: "features" },
  { title: "AI Chat Components", tag: "ai-chat" },
  { title: "Calls to Action", tag: "cta" },
  { title: "Buttons", tag: "button" },
  { title: "Testimonials", tag: "testimonials" },
  { title: "Pricing Sections", tag: "pricing-section" },
  { title: "Text Components", tag: "text" },
  { title: "Cards", tag: "card" },
  { title: "Backgrounds", tag: "background" },
  { title: "Dashboards", tag: "dashboard" },
]

export default async function ComponentsTabPage({
  params,
}: {
  params: Promise<{ tab: string }>
}) {
  const { tab } = await params
  if (!TABS.includes(tab as Tab)) notFound()

  const everything = queryComponents({
    sort: tab === "featured" ? "featured" : tab === "newest" ? "newest" : "updated",
  })

  const newest = queryComponents({ sort: "newest", limit: 10 })
  const popular = queryComponents({ sort: "popular", limit: 10 })

  return (
    <>
      <CommunityTopBar
        breadcrumb={[
          { label: "Components", href: "/community/components/featured" },
          { label: tab[0].toUpperCase() + tab.slice(1) },
        ]}
      />

      <div className="py-6">
        <div className="px-4 md:px-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            Community UI Components for React &amp; Next.js
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            Live previews, real source, and a copyable prompt for every component. Published by
            design engineers, free to use.
          </p>
        </div>

        <SectionRow title="Newest" href="/community/components/newest" components={newest} />
        <SectionRow title="Popular" href="/community/components/featured" components={popular} />

        {ROWS.map((row) => (
          <SectionRow
            key={row.tag}
            title={row.title}
            href={`/community/components/s/${row.tag}`}
            components={queryComponents({ tag: row.tag, sort: "popular", limit: 10 })}
          />
        ))}

        <section className="mt-8 border-t border-border px-4 pt-10 md:px-6">
          <h2 className="text-[15px] font-semibold tracking-tight">Explore everything</h2>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            The whole catalogue, ranked for you and reshuffled daily
          </p>
          <LoadMoreGrid components={everything} />
        </section>
      </div>
    </>
  )
}

export const dynamicParams = false
