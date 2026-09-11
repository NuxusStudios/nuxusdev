import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowUpRight, Globe, MapPin } from "lucide-react"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { ComponentGrid } from "@/components/site/component-grid"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AUTHORS, AUTHOR_MAP } from "@/lib/data/authors"
import { LIBRARIES } from "@/lib/data/libraries"
import { queryComponents } from "@/lib/queries"
import { formatCount, formatNumber, initials } from "@/lib/utils"

export function generateStaticParams() {
  return AUTHORS.map((a) => ({ handle: `@${a.handle}` }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const author = AUTHOR_MAP.get(decodeURIComponent(handle).replace(/^@/, ""))
  if (!author) return {}
  return {
    title: `${author.name} (@${author.handle}) — components`,
    description: author.bio,
  }
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle: rawHandle } = await params
  const handle = decodeURIComponent(rawHandle)
  if (!handle.startsWith("@")) notFound()

  const author = AUTHOR_MAP.get(handle.slice(1))
  if (!author) notFound()

  const components = queryComponents({ author: author.handle, sort: "popular" })
  const libraries = LIBRARIES.filter((l) => l.authorHandle === author.handle)
  const bookmarks = components.reduce((sum, c) => sum + c.bookmarks, 0)

  return (
    <div className="min-h-screen">
      <CommunityTopBar
        breadcrumb={[
          { label: "Authors", href: "/community/authors" },
          { label: author.name },
        ]}
      />

      <div className="mx-auto max-w-[1500px] px-4 py-8 md:px-6">
        <div className="flex flex-wrap items-start gap-6">
          <Avatar className="size-20 rounded-2xl">
            {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
            <AvatarFallback className="rounded-2xl text-xl">{initials(author.name)}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
              {author.name}
              {author.pro && <Badge variant="brand">Pro</Badge>}
            </h1>
            <p className="text-sm text-muted-foreground">@{author.handle}</p>
            {author.bio && (
              <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-foreground/80">
                {author.bio}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
              {author.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" /> {author.location}
                </span>
              )}
              {author.website && (
                <a
                  href={`https://${author.website}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1.5 transition-colors hover:text-foreground"
                >
                  <Globe className="size-3.5" /> {author.website}
                  <ArrowUpRight className="size-3" />
                </a>
              )}
              {author.twitter && (
                <a
                  href={`https://x.com/${author.twitter}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="transition-colors hover:text-foreground"
                >
                  @{author.twitter} on X
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm">Follow</Button>
            <Button variant="outline" size="sm">
              Share
            </Button>
          </div>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-4">
          <Stat label="Components" value={formatNumber(author.componentCount)} />
          <Stat label="Published here" value={formatNumber(components.length)} />
          <Stat label="Bookmarks" value={formatCount(bookmarks)} />
          <Stat label="Followers" value={formatCount(author.followers)} />
        </dl>

        {libraries.length > 0 && (
          <section className="mt-10">
            <h2 className="text-[15px] font-semibold tracking-tight">Libraries</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {libraries.map((lib) => (
                <Link
                  key={lib.slug}
                  href={`/@${author.handle}/library/${lib.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-border-strong hover:bg-accent/40"
                >
                  <span
                    className="flex size-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: lib.accent ?? "#3f3f46" }}
                  >
                    {lib.name.slice(0, 1)}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="text-[13px] font-medium">{lib.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {lib.componentCount} components
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-[15px] font-semibold tracking-tight">
            Components{" "}
            <span className="font-normal text-muted-foreground">({components.length})</span>
          </h2>
          <div className="mt-4">
            {components.length ? (
              <ComponentGrid components={components} />
            ) : (
              <p className="rounded-2xl border border-dashed border-border px-8 py-16 text-center text-sm text-muted-foreground">
                No components published yet.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
