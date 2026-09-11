import type { Author } from "@/lib/types"

export const AUTHORS: Author[] = [
  { handle: "nova", name: "Nova Reyes", bio: "Design engineer. Shaders, motion, and the occasional button that took 40 hours.", website: "novareyes.dev", twitter: "novabuilds", github: "novareyes", componentCount: 87, followers: 12400, location: "Lisbon, PT", pro: true },
  { handle: "kaito", name: "Kaito Mori", bio: "Building the interface layer for agents. Ex-design systems.", website: "kaito.fyi", twitter: "kaitomori", github: "kaitomori", componentCount: 64, followers: 8900, location: "Tokyo, JP", pro: true },
  { handle: "lumen", name: "Lumen Studio", bio: "A small studio shipping open-source UI. We like gradients.", website: "lumen.studio", twitter: "lumenstudio", componentCount: 112, followers: 21300, location: "Berlin, DE", pro: true },
  { handle: "amara", name: "Amara Osei", bio: "Frontend @ fintech by day, dataviz nerd by night.", github: "amaraosei", componentCount: 41, followers: 5400, location: "Accra, GH" },
  { handle: "flux", name: "Flux Labs", bio: "Motion primitives and scroll choreography for React.", website: "fluxlabs.io", componentCount: 73, followers: 15800, pro: true },
  { handle: "sable", name: "Sable Quinn", bio: "Type, grids, and restraint.", twitter: "sablequinn", componentCount: 38, followers: 4100, location: "Montreal, CA" },
  { handle: "orbit", name: "Orbit UI", bio: "Dashboard blocks and data-dense components.", website: "orbitui.com", componentCount: 96, followers: 18200, pro: true },
  { handle: "rin", name: "Rin Takahashi", bio: "Making forms that don't feel like forms.", github: "rintk", componentCount: 52, followers: 6700, location: "Osaka, JP" },
  { handle: "cobalt", name: "Cobalt", bio: "Dark-first components with obsessive focus states.", website: "cobalt.design", componentCount: 45, followers: 7300 },
  { handle: "mira", name: "Mira Delgado", bio: "Accessibility-first UI. WCAG is a floor, not a ceiling.", twitter: "miradelgado", componentCount: 33, followers: 9100, location: "Madrid, ES", pro: true },
  { handle: "vantage", name: "Vantage", bio: "Marketing sections that convert. Built with real launch data.", website: "vantage.build", componentCount: 68, followers: 11200 },
  { handle: "juno", name: "Juno Park", bio: "WebGL, GLSL, and things that shouldn't run at 60fps but do.", github: "junopark", componentCount: 29, followers: 13600, location: "Seoul, KR", pro: true },
  { handle: "atlas", name: "Atlas Kit", bio: "Enterprise-grade tables, trees, and toolbars.", website: "atlaskit.dev", componentCount: 81, followers: 6200 },
  { handle: "wren", name: "Wren Ashby", bio: "Micro-interactions. Mostly cursors.", twitter: "wrenashby", componentCount: 27, followers: 3800, location: "Bristol, UK" },
  { handle: "pixelfarm", name: "Pixelfarm", bio: "Retro, pixel, and 8-bit flavoured React components.", componentCount: 58, followers: 5100 },
  { handle: "solstice", name: "Solstice", bio: "Gradients, glass, and glow. Unapologetically.", website: "solstice.gg", componentCount: 49, followers: 8400, pro: true },
  { handle: "hana", name: "Hana Ito", bio: "AI chat interfaces and streaming UI patterns.", github: "hanaito", componentCount: 36, followers: 10300, location: "Kyoto, JP" },
  { handle: "meridian", name: "Meridian DS", bio: "A full design system, published component by component.", website: "meridian.systems", componentCount: 124, followers: 19700, pro: true },
  { handle: "tess", name: "Tess Okonkwo", bio: "Calendars, date pickers, and timezone pain.", componentCount: 31, followers: 4600, location: "Lagos, NG" },
  { handle: "arc", name: "Arc Interfaces", bio: "Navigation, docks, command palettes.", website: "arcinterfaces.com", componentCount: 44, followers: 7900 },
  { handle: "ember", name: "Ember Fields", bio: "Warm, editorial, print-inspired web UI.", twitter: "emberfields", componentCount: 26, followers: 3300 },
  { handle: "quanta", name: "Quanta", bio: "Charts and KPI tiles that hold up in production.", componentCount: 39, followers: 5900 },
  { handle: "noor", name: "Noor Haddad", bio: "RTL-first components. Arabic typography advocate.", componentCount: 22, followers: 4700, location: "Amman, JO" },
  { handle: "basis", name: "Basis", bio: "Unstyled primitives with sensible defaults.", website: "basis.dev", componentCount: 29, followers: 6100 },
  // ── imported registries (MIT) ────────────────────────────────────────
  { handle: "magicui", name: "Magic UI", bio: "150+ free and open-source animated components built with React, Tailwind and Motion.", website: "magicui.design", github: "magicuidesign", componentCount: 78, followers: 42800, pro: true },
  { handle: "kokonutui", name: "Kokonut UI", bio: "Ready-to-use React components for building modern, animated interfaces.", website: "kokonutui.com", github: "kokonut-labs", componentCount: 46, followers: 18600, pro: true },
]

export const AUTHOR_MAP = new Map(AUTHORS.map((a) => [a.handle, a]))

export function getAuthor(handle: string): Author {
  return (
    AUTHOR_MAP.get(handle) ?? {
      handle,
      name: handle,
      componentCount: 0,
      followers: 0,
    }
  )
}
