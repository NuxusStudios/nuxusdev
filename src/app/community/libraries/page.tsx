import Link from "next/link"
import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { rankedLibraries } from "@/lib/queries"
import { getAuthor } from "@/lib/data/authors"
import { formatCount } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Component Libraries",
  description:
    "Open-source React component libraries published on Nuxus, each with live previews and copyable prompts.",
}

export default function LibrariesPage() {
  const libraries = rankedLibraries()

  return (
    <>
      <CommunityTopBar
        breadcrumb={[
          { label: "Components", href: "/community/components/featured" },
          { label: "Libraries" },
        ]}
      />

      <div className="px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Component Libraries</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Collections published as a set — install one component or browse the whole system.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {libraries.map((lib) => {
            const author = getAuthor(lib.authorHandle)
            return (
              <Link
                key={lib.slug}
                href={`/@${lib.authorHandle}/library/${lib.slug}`}
                className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
              >
                <div className="flex items-start justify-between">
                  <span
                    className="flex size-10 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: lib.accent ?? "#3f3f46" }}
                  >
                    {lib.name.slice(0, 1)}
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>

                <h2 className="mt-4 text-[15px] font-semibold">{lib.name}</h2>
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                  {lib.description}
                </p>

                <div className="mt-auto flex items-center justify-between pt-5 text-[13px]">
                  <span className="text-muted-foreground">by {author.name}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {formatCount(lib.componentCount)} components
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
