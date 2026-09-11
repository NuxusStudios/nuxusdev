import Link from "next/link"
import type { Metadata } from "next"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { rankedAuthors } from "@/lib/queries"
import { formatCount, formatNumber, initials } from "@/lib/utils"

export const metadata: Metadata = {
  title: "UI Component Authors — Top Creators",
  description:
    "Browse the design engineers publishing React components on Nuxus, ranked by how often their work gets bookmarked.",
}

export default function AuthorsPage() {
  const authors = rankedAuthors()
  const top = authors.slice(0, 3)
  const month = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <>
      <CommunityTopBar
        breadcrumb={[{ label: "Components", href: "/community/components/featured" }, { label: "Authors" }]}
      />

      <div className="px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Component Authors</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Top authors in {month}. Ranked by bookmarks on components published in the last 30 days.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {top.map((author, i) => (
            <Link
              key={author.handle}
              href={`/@${author.handle}`}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
            >
              <span className="absolute right-4 top-4 font-mono text-3xl font-semibold text-foreground/[0.06]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <Avatar className="size-11">
                {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
                <AvatarFallback className="text-sm">{initials(author.name)}</AvatarFallback>
              </Avatar>
              <h2 className="mt-3.5 flex items-center gap-2 text-[15px] font-semibold">
                {author.name}
                {author.pro && <Badge variant="brand">Pro</Badge>}
              </h2>
              <p className="text-sm text-muted-foreground">@{author.handle}</p>
              <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
                {author.bio}
              </p>
              <div className="mt-4 flex gap-5 text-[13px]">
                <span>
                  <span className="font-medium tabular-nums">{author.componentCount}</span>{" "}
                  <span className="text-muted-foreground">components</span>
                </span>
                <span>
                  <span className="font-medium tabular-nums">{formatCount(author.followers)}</span>{" "}
                  <span className="text-muted-foreground">followers</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <h2 className="text-[15px] font-semibold tracking-tight">All authors</h2>
          <p className="mb-5 mt-1 text-sm text-muted-foreground">
            Browse creators ranked by the popularity of their components ·{" "}
            {formatNumber(authors.length)} authors
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {authors.map((author) => (
              <Link
                key={author.handle}
                href={`/@${author.handle}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-border-strong hover:bg-accent/40"
              >
                <Avatar className="size-9">
                  {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
                  <AvatarFallback>{initials(author.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{author.name}</p>
                  <p className="truncate text-xs text-muted-foreground">@{author.handle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[13px] font-medium tabular-nums">{author.componentCount}</p>
                  <p className="text-[11px] text-muted-foreground">components</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
