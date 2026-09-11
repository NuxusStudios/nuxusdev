import type { Metadata } from "next"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { RegistryDirectory } from "@/components/site/registry-directory"
import { EcosystemResults } from "@/components/site/ecosystem-results"
import { EcosystemSearch } from "@/components/site/ecosystem-search"
import { REGISTRIES, REGISTRIES_SNAPSHOT_AT } from "@/lib/data/registries"
import { ecosystemStats, searchEcosystem } from "@/server/ecosystem"

export const metadata: Metadata = {
  title: "shadcn Registry Directory",
  description: `Search ${REGISTRIES.length} public shadcn registries at once — every component in the ecosystem, with the command that installs it.`,
}

export default async function RegistriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const stats = ecosystemStats()
  const results = q ? searchEcosystem({ q, limit: 36 }) : []

  return (
    <>
      <CommunityTopBar
        breadcrumb={[
          { label: "Components", href: "/community/components/featured" },
          { label: "Registries" },
        ]}
      />

      <div className="px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">The whole shadcn ecosystem</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {stats.items.toLocaleString("en-US")} components across {stats.registries} public
          registries, searchable in one place. Everything installs from its own registry — we index
          what exists, we don&apos;t rehost it.
        </p>

        <div className="mt-7 max-w-xl">
          <EcosystemSearch initialQuery={q ?? ""} />
        </div>

        {q ? (
          results.length ? (
            <>
              <p className="mt-6 text-[13px] text-muted-foreground">
                {results.length === 36 ? "Top 36 matches" : `${results.length} matches`} for “{q}”
              </p>
              <EcosystemResults results={results} />
            </>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Nothing matched “{q}”. Try a shorter or more common term.
            </p>
          )
        ) : (
          <div className="mt-12">
            <h2 className="text-[15px] font-semibold">Browse the registries</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Add one to <code className="rounded bg-muted px-1 py-0.5 text-[12px]">components.json</code>{" "}
              and install from it by namespace. Health figures come from the official index.
            </p>
            <RegistryDirectory registries={REGISTRIES} snapshotAt={REGISTRIES_SNAPSHOT_AT} />
          </div>
        )}
      </div>
    </>
  )
}
