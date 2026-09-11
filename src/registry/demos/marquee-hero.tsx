import { MarqueeHero } from "@/registry/components/marquee-hero"

/**
 * Unwrapped deliberately: the hero is h-screen and its marquee sits on the
 * section's bottom edge, so a fixed-height wrapper clips the marquee away.
 */
export default function DemoMarqueeHero() {
  return (
    <MarqueeHero
      tagline="Trusted by teams that ship"
      title={
        <>
          Engage audiences
          <br />
          with work that moves
        </>
      }
      description="Interfaces, motion and brand systems built by people who care what happens after the handoff."
      ctaText="Start a project"
    />
  )
}
