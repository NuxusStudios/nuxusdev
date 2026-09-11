import Link from "next/link"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { POSTS } from "@/lib/data/posts"
import { getAuthor } from "@/lib/data/authors"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initials } from "@/lib/utils"

export const metadata: Metadata = { title: "Blog" }

export default function BlogPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-page py-14">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Blog</h1>
        <p className="mt-4 max-w-xl text-[17px] text-muted-foreground">
          Notes on the registry, the tooling around it, and the design engineering behind both.
        </p>

        <div className="mt-10 divide-y divide-border border-t border-border">
          {POSTS.map((post) => {
            const author = getAuthor(post.authorHandle)
            return (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col gap-2 py-7">
                <span className="text-xs text-muted-foreground">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  · {post.readingTime}
                </span>
                <h2 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-foreground/80">
                  {post.title}
                </h2>
                <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </p>
                <span className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Avatar className="size-5">
                    <AvatarFallback>{initials(author.name)}</AvatarFallback>
                  </Avatar>
                  {author.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
