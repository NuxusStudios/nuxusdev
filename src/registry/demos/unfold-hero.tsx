import { UnfoldHero } from "@/registry/components/unfold-hero"

export default function DemoUnfoldHero() {
  return (
    <div className="w-full">
      <UnfoldHero />
      {/* The panel unfolds against the scroll, so the demo needs room to scroll. */}
      <div className="h-[60vh] w-full bg-background" />
    </div>
  )
}
