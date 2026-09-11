import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowUpRight, Check, Layers } from "lucide-react"
import { SiteHeader } from "@/components/site/site-header"
import { ComponentPreview } from "@/components/site/component-preview"
import { ComponentCard } from "@/components/site/component-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TEMPLATES, TEMPLATE_MAP } from "@/lib/data/templates"
import { getAuthor } from "@/lib/data/authors"
import { TAG_MAP } from "@/lib/data/tags"
import { queryComponents } from "@/lib/queries"
import { formatCount } from "@/lib/utils"

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const template = TEMPLATE_MAP.get(slug)
  return template ? { title: `${template.name} — React template`, description: template.description } : {}
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const template = TEMPLATE_MAP.get(slug)
  if (!template) notFound()

  const author = getAuthor(template.authorHandle)
  const built = template.tags.flatMap((tag) => queryComponents({ tag, sort: "popular", limit: 2 }))
  const unique = [...new Map(built.map((c) => [c.id, c])).values()].slice(0, 6)

  return (
    <>
      <SiteHeader />

      <div className="container-page py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-3xl font-semibold tracking-tight">
              {template.name}
              {template.price === 0 ? (
                <Badge variant="new">Free</Badge>
              ) : (
                <Badge variant="brand">${template.price}</Badge>
              )}
            </h1>
            <p className="mt-2 max-w-2xl text-[15px] text-muted-foreground">
              {template.description}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-4 text-[13px] text-muted-foreground">
              <Link href={`/@${author.handle}`} className="transition-colors hover:text-foreground">
                by {author.name}
              </Link>
              <span className="flex items-center gap-1.5">
                <Layers className="size-3.5" /> {template.pages} pages
              </span>
              <span>{formatCount(template.bookmarks)} bookmarks</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button>{template.price === 0 ? "Download free" : `Buy for $${template.price}`}</Button>
            {template.demoUrl && (
              <Button variant="outline" asChild>
                <a href={`https://${template.demoUrl}`} target="_blank" rel="noreferrer noopener">
                  Live demo <ArrowUpRight className="size-3.5" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="mt-7">
          <ComponentPreview
            previewKey={template.previewKey}
            aspect={16 / 11}
            frameWidth={1400}
            interactive
            eager
            className="shadow-2xl shadow-black/40"
          />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="text-[15px] font-semibold">What&apos;s inside</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                `${template.pages} pre-built pages`,
                "React 19 + Next.js App Router",
                "Tailwind v4 tokens, shadcn conventions",
                "Dark and light themes",
                "Responsive down to 360px",
                "Every section is its own component",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[15px] font-semibold">Categories</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {template.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/community/components/s/${tag}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                >
                  {TAG_MAP.get(tag)?.name ?? tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {unique.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[15px] font-semibold">Built from these components</h2>
            <div className="mt-4 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              {unique.map((c) => (
                <ComponentCard key={c.id} component={c} aspect={16 / 10} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
