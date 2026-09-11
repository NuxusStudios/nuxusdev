import type { Metadata } from "next"
import { NuxusHero } from "@/components/landing/nuxus-hero"
import { ComponentWall } from "@/components/landing/component-wall"
import { ThreeWays } from "@/components/landing/three-ways"
import { NuxusLibraries } from "@/components/landing/nuxus-libraries"
import { NuxusCta } from "@/components/landing/nuxus-cta"
import { NuxusFaq } from "@/components/landing/nuxus-faq"
import { COMPONENTS } from "@/lib/data/components"
import { LIBRARIES } from "@/lib/data/libraries"
import { AUTHORS } from "@/lib/data/authors"
import { queryComponents } from "@/lib/queries"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = {
  title: BRAND.tagline,
  description: BRAND.description,
}

/** hand-picked for the wall — the ones that read best in motion */
const SHOWCASE = [
  "mesh-gradient",
  "glow-card",
  "plasma-shader",
  "macos-dock",
  "ai-chat-input",
  "wave-lines",
  "notification-list",
  "bento-grid",
  "animated-hero",
]

export default function HomePage() {
  const bySlug = new Map(COMPONENTS.map((c) => [c.slug, c]))
  const showcase = SHOWCASE.map((slug) => bySlug.get(slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c)
  )

  // top up from the featured pool if a pick ever gets renamed
  const filler = queryComponents({ sort: "featured", limit: 12 }).filter(
    (c) => !showcase.some((s) => s.id === c.id)
  )
  const wall = [...showcase, ...filler].slice(0, 9)

  return (
    <>
      <NuxusHero
        componentCount={COMPONENTS.length}
        libraryCount={LIBRARIES.length}
        authorCount={AUTHORS.length}
      />
      <ComponentWall components={wall} />
      <ThreeWays />
      <NuxusLibraries />
      <NuxusCta />
      <NuxusFaq />
    </>
  )
}
