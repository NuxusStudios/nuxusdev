import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { IconSearch } from "@/components/site/icon-search"
import { ICON_SETS, TOTAL_ICONS } from "@/server/icons"
import { formatNumber } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Icons",
  description:
    "Search tens of thousands of open-source icons across Tabler, Phosphor, Material, Remix, Heroicons, Lucide, Bootstrap and Simple Icons.",
}

export default function IconsPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-page py-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Icons</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            {formatNumber(TOTAL_ICONS)} icons across {ICON_SETS.length} open-source sets, searchable
            in one place. Click any icon to copy it.
          </p>
        </div>

        <IconSearch sets={ICON_SETS} total={TOTAL_ICONS} />
      </div>
    </>
  )
}
