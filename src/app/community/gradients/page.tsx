import type { Metadata } from "next"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { GradientStudio } from "@/components/site/gradient-studio"

export const metadata: Metadata = {
  title: "Gradient Studio",
  description: "Generate mesh and linear gradients, then copy them as CSS or as a React component.",
}

export default function GradientsPage() {
  return (
    <>
      <CommunityTopBar
        breadcrumb={[
          { label: "Components", href: "/community/components/featured" },
          { label: "Gradients" },
        ]}
      />
      <div className="px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Gradient Studio</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Build a mesh or linear gradient, shuffle until it sings, then copy it as CSS or as a
          React component.
        </p>
        <GradientStudio />
      </div>
    </>
  )
}
