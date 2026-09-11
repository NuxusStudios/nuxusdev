import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { IconSearch } from "@/components/site/icon-search"

export const metadata: Metadata = {
  title: "Icons",
  description: "Search thousands of open-source icons by name and copy them as JSX or SVG.",
}

export default function IconsPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-page py-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Icons</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Search the whole set by name or by what it means — &ldquo;delete&rdquo; finds the trash
            can. Click any icon to copy it as JSX.
          </p>
        </div>
        <IconSearch />
      </div>
    </>
  )
}
