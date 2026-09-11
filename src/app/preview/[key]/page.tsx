import { notFound } from "next/navigation"
import { ALL_PREVIEWS } from "@/registry"
import { PreviewProviders } from "@/components/site/preview-providers"

/**
 * Rendered on demand rather than prerendered.
 *
 * Prerendering all ~165 previews compiles every registry component at build
 * time, which is more memory than shared hosting gives a build process. On a
 * long-lived Node server the first request for each preview pays the cost once
 * and the result is cached.
 */
export const dynamicParams = true

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  const Demo = ALL_PREVIEWS[key]
  if (!Demo) notFound()

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="w-full">
        <PreviewProviders>
          <Demo />
        </PreviewProviders>
      </div>
    </div>
  )
}
