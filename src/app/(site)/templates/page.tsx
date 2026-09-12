import Link from "next/link"
import type { Metadata } from "next"
import { ArrowUpRight, Layers } from "lucide-react"
import { SiteHeader } from "@/components/site/site-header"
import { ComponentPreview } from "@/components/site/component-preview"
import { Badge } from "@/components/ui/badge"
import { getTemplateStatuses } from "@/server/templates"
import { TEMPLATES } from "@/lib/data/templates"
import { getAuthor } from "@/lib/data/authors"
import { formatCount } from "@/lib/utils"

export const metadata: Metadata = {
  title: "React Templates",
  description:
    "Full multi-page React templates — landing pages, dashboards and launch pages — with live previews and real source.",
}

// what each card may say depends on who is asking
export const dynamic = "force-dynamic"

export default async function TemplatesPage() {
  const access = await getTemplateStatuses(TEMPLATES.map((t) => t.slug))

  return (
    <>
      <SiteHeader />

      <div className="container-page py-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">React Templates</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Complete, multi-page starters built from components in the registry. Preview them live,
            then take the whole thing or just the parts you need.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {TEMPLATES.map((template) => {
            const author = getAuthor(template.authorHandle)
            return (
              <Link
                key={template.id}
                href={`/templates/${template.slug}`}
                className="group flex flex-col gap-3"
              >
                <ComponentPreview
                  previewKey={template.previewKey}
                  aspect={16 / 11}
                  frameWidth={1400}
                  className="transition-colors group-hover:border-border-strong"
                />
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                      {template.name}
                      {/*
                        A price on something the reader already owns reads as a
                        second charge, so ownership wins over the number.
                      */}
                      {access.get(template.slug) === "included" ? (
                        <Badge variant="new">Included</Badge>
                      ) : access.get(template.slug) === "purchased" ? (
                        <Badge variant="new">Owned</Badge>
                      ) : template.price === 0 ? (
                        <Badge variant="new">Free</Badge>
                      ) : (
                        <Badge variant="brand">${template.price}</Badge>
                      )}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <p className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>by {author.name}</span>
                      <span className="flex items-center gap-1">
                        <Layers className="size-3" />
                        {template.pages} pages
                      </span>
                      <span>{formatCount(template.bookmarks)} bookmarks</span>
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted-foreground/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
