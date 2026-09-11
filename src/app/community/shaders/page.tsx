import type { Metadata } from "next"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { ComponentGrid } from "@/components/site/component-grid"
import { Badge } from "@/components/ui/badge"
import { queryComponents } from "@/lib/queries"

export const metadata: Metadata = {
  title: "Shaders",
  description: "WebGL and canvas shader components — plasma, waves, grain and mesh gradients.",
}

export default function ShadersPage() {
  const shaders = queryComponents({ tag: "shaders", sort: "popular" })

  return (
    <>
      <CommunityTopBar
        breadcrumb={[
          { label: "Components", href: "/community/components/featured" },
          { label: "Shaders" },
        ]}
      />

      <div className="px-4 py-8 md:px-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          Shaders <Badge variant="new">New</Badge>
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Real-time backgrounds built with WebGL and canvas. Every one runs at 60fps, degrades
          gracefully, and drops into a section without a dependency.
        </p>

        <div className="mt-8">
          <ComponentGrid components={shaders} />
        </div>
      </div>
    </>
  )
}
