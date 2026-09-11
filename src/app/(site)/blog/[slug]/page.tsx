import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft } from "lucide-react"
import { SiteHeader } from "@/components/site/site-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { POSTS, POST_MAP } from "@/lib/data/posts"
import { getAuthor } from "@/lib/data/authors"
import { initials } from "@/lib/utils"

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = POST_MAP.get(slug)
  return post ? { title: post.title, description: post.excerpt } : {}
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = POST_MAP.get(slug)
  if (!post) notFound()

  const author = getAuthor(post.authorHandle)

  return (
    <>
      <SiteHeader />
      <article className="container-page py-14">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> All posts
        </Link>

        <div className="mx-auto mt-8 max-w-2xl">
          <p className="text-xs text-muted-foreground">
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {post.readingTime}
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-[1.1] tracking-tight">{post.title}</h1>

          <div className="mt-6 flex items-center gap-2.5 border-b border-border pb-6">
            <Avatar className="size-8">
              <AvatarFallback>{initials(author.name)}</AvatarFallback>
            </Avatar>
            <div className="leading-tight">
              <Link href={`/@${author.handle}`} className="block text-[13px] font-medium hover:underline">
                {author.name}
              </Link>
              <span className="block text-xs text-muted-foreground">@{author.handle}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-5">
            {post.body.map((para, i) => (
              <p key={i} className="text-[17px] leading-[1.75] text-foreground/80">
                {para}
              </p>
            ))}
          </div>
        </div>
      </article>
    </>
  )
}
