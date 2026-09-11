import type { Metadata } from "next"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { RegistryDirectory } from "@/components/site/registry-directory"
import { REGISTRIES, REGISTRIES_SNAPSHOT_AT } from "@/lib/data/registries"

export const metadata: Metadata = {
  title: "shadcn Registry Directory",
  description: `Every public shadcn registry in the official index — ${REGISTRIES.length} of them, with uptime and install commands.`,
}

export default function RegistriesPage() {
  return (
    <>
      <CommunityTopBar
        breadcrumb={[
          { label: "Components", href: "/community/components/featured" },
          { label: "Registries" },
        ]}
      />

      <div className="px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">shadcn Registry Directory</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Every public registry in the official shadcn index — {REGISTRIES.length} of them. Add one
          to <code className="rounded bg-muted px-1 py-0.5 text-[12px]">components.json</code> and
          install from it by namespace. Health figures come from the index itself.
        </p>

        <RegistryDirectory registries={REGISTRIES} snapshotAt={REGISTRIES_SNAPSHOT_AT} />
      </div>
    </>
  )
}
