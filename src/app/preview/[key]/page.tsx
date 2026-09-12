import { notFound } from "next/navigation"
import { ALL_PREVIEWS } from "@/registry"
import { PreviewProviders } from "@/components/site/preview-providers"
import { previewThemeCss } from "@/server/brand-theme"
import { getCurrentUser } from "@/server/session"

/**
 * Rendered on demand rather than prerendered.
 *
 * Prerendering all ~165 previews compiles every registry component at build
 * time, which is more memory than shared hosting gives a build process. On a
 * long-lived Node server the first request for each preview pays the cost once
 * and the result is cached.
 *
 * `?theme=` re-skins the demo: a catalogue theme by slug, or "mine" for the
 * signed-in user's own tokens. The URL only ever names a theme — the CSS comes
 * from the catalogue or the database, never from the query string.
 */
export const dynamicParams = true

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>
  searchParams: Promise<{ theme?: string }>
}) {
  const [{ key }, { theme }] = await Promise.all([params, searchParams])
  const Demo = ALL_PREVIEWS[key]
  if (!Demo) notFound()

  const user = theme ? await getCurrentUser() : null
  const css = await previewThemeCss(theme, user?.id ?? null)

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      {/*
        overscroll-contain keeps a scroll-driven demo from handing the wheel
        back to the page the moment it reaches its own end, which otherwise
        yanks the reader away mid-effect.
      */}
      <style>{`html,body{overscroll-behavior:contain}`}</style>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div className="w-full">
        <PreviewProviders>
          <Demo />
        </PreviewProviders>
      </div>
    </div>
  )
}
