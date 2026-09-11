import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import Link from "next/link"
import { Lock } from "lucide-react"
import { PublishForm, type PublishDraft } from "@/components/site/publish-form"
import { COMPONENT_MAP } from "@/lib/data/components"
import { readComponentSource, readDemoSource } from "@/lib/source"
import { getEntitlements } from "@/server/entitlements"

export const metadata: Metadata = {
  title: "Publish a component",
  description:
    "Publish your React component to the registry — add a demo, pick categories and a license, and it goes live with a preview and a prompt.",
}

/**
 * Remixing prefills the form with an existing component's source, so it has to
 * pass the same paywall as copying — otherwise it would be a way to read gated
 * source for free.
 */
async function draftFor(componentId: string | undefined): Promise<PublishDraft | null> {
  if (!componentId) return null

  const component = COMPONENT_MAP.get(componentId)
  if (!component) return null

  const { canCopy } = await getEntitlements()
  if (!canCopy) return null

  const [code, demo] = await Promise.all([
    readComponentSource(component.previewKey),
    readDemoSource(component.previewKey),
  ])

  return {
    name: `${component.name} (remix)`,
    description: component.description,
    code,
    demo,
    license: component.license,
    deps: component.dependencies.join(", "),
    tags: component.tags.slice(0, 5),
  }
}

export default async function PublishPage({
  searchParams,
}: {
  searchParams: Promise<{ remix?: string }>
}) {
  const { remix } = await searchParams
  const draft = await draftFor(remix)
  const blocked = Boolean(remix) && !draft

  return (
    <>
      <SiteHeader />
      <div className="container-page py-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Publish a component</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Paste your component and a demo that renders it. We build the preview, generate the
            prompt and put it in front of every builder browsing your categories.
          </p>
        </div>

        {blocked && (
          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-[13px]">
            <Lock className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">
              Remixing starts from another component&apos;s source, which needs a plan.
            </span>
            <Link href="/pricing" className="ml-auto font-medium underline-offset-4 hover:underline">
              See plans
            </Link>
          </div>
        )}

        <PublishForm draft={draft ?? undefined} />
      </div>
    </>
  )
}
