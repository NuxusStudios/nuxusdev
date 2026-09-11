import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { ThemeGallery } from "@/components/site/theme-gallery"
import { THEMES } from "@/lib/data/themes"

export const metadata: Metadata = {
  title: "shadcn Themes",
  description:
    "Ready-made shadcn/ui themes — colours, radii and type — with the CSS variables to paste into your globals.css.",
}

export default function ThemesPage() {
  return (
    <>
      <SiteHeader />

      <div className="container-page py-14">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">shadcn Themes</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Complete token sets — colours, radius and type — that drop straight into your
            globals.css. Preview a theme on a real component before you take it.
          </p>
        </div>

        <ThemeGallery themes={THEMES} />
      </div>
    </>
  )
}
