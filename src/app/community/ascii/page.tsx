import type { Metadata } from "next"
import { CommunityTopBar } from "@/components/site/community-topbar"
import { AsciiStudio } from "@/components/site/ascii-studio"

export const metadata: Metadata = {
  title: "ASCII Art Studio",
  description: "Turn text or an image into ASCII art and copy it as plain text or a React component.",
}

export default function AsciiPage() {
  return (
    <>
      <CommunityTopBar
        breadcrumb={[
          { label: "Components", href: "/community/components/featured" },
          { label: "ASCII Art" },
        ]}
      />
      <div className="px-4 py-8 md:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">ASCII Art Studio</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Type something, tune the ramp, and copy the result as text or as a React component. The
          rendering happens entirely in your browser on a canvas.
        </p>
        <AsciiStudio />
      </div>
    </>
  )
}
