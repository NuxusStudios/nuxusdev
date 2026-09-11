import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowUpRight, Package } from "lucide-react"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { ComponentPreview } from "@/components/site/component-preview"
import { ComponentCard } from "@/components/site/component-card"
import { ComponentCode } from "@/components/site/component-code"
import { teaserLineCount } from "@/lib/teaser"
import { CliDialog, CopyPromptButton } from "@/components/site/copy-buttons"
import { RemixButton, ReportButton, SaveButton } from "@/components/site/component-actions"
import { getEntitlements } from "@/server/entitlements"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getAuthor } from "@/lib/data/authors"
import { LIBRARY_MAP } from "@/lib/data/libraries"
import { TAG_MAP } from "@/lib/data/tags"
import { getComponent, similarComponents, queryComponents } from "@/lib/queries"
import { readComponentSource, readDemoSource } from "@/lib/source"
import { highlight } from "@/lib/highlight"
import { formatCount, formatDate, formatNumber, initials } from "@/lib/utils"
import { BRAND } from "@/lib/brand"

/**
 * Not prerendered: the page reads the viewer's entitlements to decide how much
 * source to send, so every render is request-specific anyway.
 */
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>
}): Promise<Metadata> {
  const { handle, slug } = await params
  const component = getComponent(decodeURIComponent(handle).replace(/^@/, ""), slug)
  if (!component) return {}
  return {
    title: `${component.name} | Community Components`,
    description: component.description,
  }
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ handle: string; slug: string }>
}) {
  const { handle: rawHandle, slug } = await params
  const handle = decodeURIComponent(rawHandle)
  if (!handle.startsWith("@")) notFound()

  const component = getComponent(handle.slice(1), slug)
  if (!component) notFound()

  const author = getAuthor(component.authorHandle)
  const library = component.librarySlug ? LIBRARY_MAP.get(component.librarySlug) : undefined

  const entitlements = await getEntitlements()

  const [code, demoCode] = await Promise.all([
    readComponentSource(component.previewKey),
    readDemoSource(component.previewKey),
  ])

  // Without a plan only the opening lines are highlighted and sent — the rest
  // of the source never reaches the browser.
  const codeLines = code.split("\n")
  const demoLines = demoCode.split("\n")
  const codeShown = entitlements.canCopy ? codeLines.length : teaserLineCount(codeLines.length)
  const demoShown = entitlements.canCopy ? demoLines.length : teaserLineCount(demoLines.length)

  const [codeHtml, demoHtml] = await Promise.all([
    highlight(codeLines.slice(0, codeShown).join("\n")),
    highlight(demoLines.slice(0, demoShown).join("\n")),
  ])

  const similar = similarComponents(component, 6)

  return (
    <div className="min-h-screen">
      <CommunityTopBar
        breadcrumb={[
          library
            ? { label: library.name, href: `/@${library.authorHandle}/library/${library.slug}` }
            : { label: "Components", href: "/community/components/featured" },
          { label: component.name },
        ]}
      />

      <div className="mx-auto max-w-[1500px] px-4 py-7 md:px-6">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight">{component.name}</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
              {component.description}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
              {library && (
                <>
                  <Link
                    href={`/@${library.authorHandle}/library/${library.slug}`}
                    className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <span
                      className="flex size-4 items-center justify-center rounded text-[9px] font-bold text-white"
                      style={{ backgroundColor: library.accent ?? "#3f3f46" }}
                    >
                      {library.name.slice(0, 1)}
                    </span>
                    {library.name}
                  </Link>
                  <span className="text-muted-foreground/40">·</span>
                </>
              )}
              <span className="text-muted-foreground">by</span>
              <Link
                href={`/@${author.handle}`}
                className="flex items-center gap-1.5 transition-colors hover:text-foreground"
              >
                <Avatar className="size-5">
                  {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
                  <AvatarFallback>{initials(author.name)}</AvatarFallback>
                </Avatar>
                {author.name}
              </Link>
              {author.pro && <Badge variant="brand">Pro</Badge>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CopyPromptButton
              componentId={component.id}
              name={component.name}
              canCopy={entitlements.canCopy}
            />
            <SaveButton componentId={component.id} name={component.name} />
            <RemixButton componentId={component.id} />
            <CliDialog
              componentId={component.id}
              fileName={component.fileName}
              dependencies={component.dependencies}
              canCopy={entitlements.canCopy}
            />
            <ReportButton />
          </div>
        </div>

        {/* preview + code */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <ComponentPreview
              previewKey={component.previewKey}
              frameWidth={component.previewWidth ?? 1200}
              aspect={16 / 10}
              interactive
              eager
              className="shadow-2xl shadow-black/30"
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Bookmarks" value={formatNumber(component.bookmarks)} />
              <Stat label="Installs" value={formatNumber(component.installs)} />
              <Stat label="Views" value={formatNumber(component.views)} />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <ComponentCode
              componentId={component.id}
              canCopy={entitlements.canCopy}
              files={[
                {
                  name: component.demoFileName,
                  html: demoHtml,
                  kind: "demo",
                  totalLines: demoLines.length,
                  shownLines: demoShown,
                },
                {
                  name: component.fileName,
                  html: codeHtml,
                  kind: "component",
                  totalLines: codeLines.length,
                  shownLines: codeShown,
                },
              ]}
            />

            <dl className="divide-y divide-border rounded-xl border border-border">
              <Meta label="Dependencies">
                {component.dependencies.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {component.dependencies.map((dep) => (
                      <span
                        key={dep}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary/50 px-1.5 py-0.5 font-mono text-[11.5px] text-muted-foreground"
                      >
                        <Package className="size-3" />
                        {dep}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground">None — plain React + Tailwind</span>
                )}
              </Meta>

              {component.source && (
                <Meta label="Source">
                  <a
                    href={`https://${component.source}`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                  >
                    {component.source}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </Meta>
              )}

              <Meta label="License">{component.license}</Meta>
              <Meta label="Published">{formatDate(component.createdAt)}</Meta>
              <Meta label="Categories">
                <div className="flex flex-wrap gap-1.5">
                  {component.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/community/components/s/${tag}`}
                      className="rounded-full border border-border px-2 py-0.5 text-[11.5px] transition-colors hover:border-border-strong hover:text-foreground"
                    >
                      {TAG_MAP.get(tag)?.name ?? tag}
                    </Link>
                  ))}
                </div>
              </Meta>
            </dl>
          </div>
        </div>

        {/* similar */}
        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="text-[15px] font-semibold tracking-tight">Similar components</h2>
            <div className="mt-4 grid gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
              {similar.map((c) => (
                <ComponentCard key={c.id} component={c} aspect={16 / 10} />
              ))}
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              That&apos;s all {similar.length} components
            </p>
          </section>
        )}

        {/* explore more */}
        <section className="mt-14 border-t border-border pt-8">
          <h2 className="text-[15px] font-semibold tracking-tight">Explore more</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {library
              ? `Part of ${library.name} — browse the full library on ${BRAND.name}.`
              : "Browse related categories on 21st."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {component.tags.map((tag) => {
              const meta = TAG_MAP.get(tag)
              const live = queryComponents({ tag }).length
              return (
                <Link
                  key={tag}
                  href={`/community/components/s/${tag}`}
                  className="rounded-lg border border-border px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:bg-accent hover:text-foreground"
                >
                  {meta?.name ?? tag} components
                  <span className="ml-1.5 tabular-nums text-muted-foreground/60">
                    {formatCount(meta?.count ?? live)}
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xl font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
      <dt className="w-28 shrink-0 text-[13px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 text-[13px] text-foreground/85">{children}</dd>
    </div>
  )
}
