import type { Metadata } from "next"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { AppsDirectory } from "@/components/site/apps-directory"
import { APPS, APPS_SNAPSHOT_AT } from "@/lib/data/apps"

export const metadata: Metadata = {
  title: "Open-source Apps",
  description: `${APPS.length} open-source apps built with React, Next.js and more — real repositories with live star counts.`,
}

export default function AppsPage() {
  return (
    <>
      <CommunityTopBar
        breadcrumb={[
          { label: "Components", href: "/community/components/featured" },
          { label: "Apps" },
        ]}
      />

      <div className="px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Open-source apps for React, Next.js and more
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {APPS.length} real repositories worth reading — the fastest way to see how a whole product
          is put together rather than a single component. Descriptions, licences and star counts
          come from GitHub, last checked{" "}
          {new Date(APPS_SNAPSHOT_AT).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}
          .
        </p>

        <AppsDirectory apps={APPS} />
      </div>
    </>
  )
}
