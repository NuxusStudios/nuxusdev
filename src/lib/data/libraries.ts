import type { Library } from "@/lib/types"

export const LIBRARIES: Library[] = [
  { slug: "lumen-ui", name: "Lumen UI", authorHandle: "lumen", description: "Gradient-forward marketing blocks and animated heroes.", website: "lumen.studio", componentCount: 112, accent: "#7c5cff" },
  { slug: "meridian", name: "Meridian DS", authorHandle: "meridian", description: "A complete design system published one component at a time.", website: "meridian.systems", componentCount: 124, accent: "#00c2a8" },
  { slug: "orbit-ui", name: "Orbit UI", authorHandle: "orbit", description: "Dashboards, tables and data-dense product surfaces.", website: "orbitui.com", componentCount: 96, accent: "#f59e0b" },
  { slug: "nova-kit", name: "Nova Kit", authorHandle: "nova", description: "Shaders, scroll effects and motion-heavy sections.", website: "novareyes.dev", componentCount: 87, accent: "#008fe9" },
  { slug: "atlas-kit", name: "Atlas Kit", authorHandle: "atlas", description: "Enterprise-grade trees, toolbars and virtualised tables.", website: "atlaskit.dev", componentCount: 81, accent: "#64748b" },
  { slug: "flux-motion", name: "Flux Motion", authorHandle: "flux", description: "Motion primitives, scroll choreography and transitions.", website: "fluxlabs.io", componentCount: 73, accent: "#ec4899" },
  { slug: "vantage-blocks", name: "Vantage Blocks", authorHandle: "vantage", description: "Conversion-tested landing page sections.", website: "vantage.build", componentCount: 68, accent: "#22c55e" },
  { slug: "kaito-ui", name: "Kaito UI", authorHandle: "kaito", description: "Agent-ready interface patterns and AI surfaces.", website: "kaito.fyi", componentCount: 64, accent: "#a855f7" },
  { slug: "pixelfarm", name: "Pixelfarm", authorHandle: "pixelfarm", description: "8-bit and retro-styled React components.", componentCount: 58, accent: "#eab308" },
  { slug: "rin-forms", name: "Rin Forms", authorHandle: "rin", description: "Forms, inputs and validation patterns.", componentCount: 52, accent: "#06b6d4" },
  { slug: "solstice", name: "Solstice", authorHandle: "solstice", description: "Glass, glow and gradient surfaces.", website: "solstice.gg", componentCount: 49, accent: "#f43f5e" },
  { slug: "arc-interfaces", name: "Arc Interfaces", authorHandle: "arc", description: "Navigation, docks and command palettes.", website: "arcinterfaces.com", componentCount: 44, accent: "#3b82f6" },
  { slug: "cobalt", name: "Cobalt", authorHandle: "cobalt", description: "Dark-first components with obsessive focus states.", website: "cobalt.design", componentCount: 45, accent: "#2563eb" },
  { slug: "quanta-charts", name: "Quanta Charts", authorHandle: "quanta", description: "Charts and KPI tiles built for production dashboards.", componentCount: 39, accent: "#14b8a6" },
  { slug: "sable-type", name: "Sable Type", authorHandle: "sable", description: "Typographic components, grids and editorial layouts.", componentCount: 38, accent: "#d97706" },
  { slug: "hana-chat", name: "Hana Chat", authorHandle: "hana", description: "AI chat interfaces and streaming UI patterns.", componentCount: 36, accent: "#8b5cf6" },
  { slug: "amara-viz", name: "Amara Viz", authorHandle: "amara", description: "Data visualisation for the web, no D3 PhD required.", componentCount: 41, accent: "#0ea5e9" },
  { slug: "mira-a11y", name: "Mira A11y", authorHandle: "mira", description: "Accessibility-first components, audited and documented.", componentCount: 33, accent: "#10b981" },
  { slug: "tess-time", name: "Tess Time", authorHandle: "tess", description: "Calendars, date pickers and scheduling UI.", componentCount: 31, accent: "#f97316" },
  { slug: "juno-gl", name: "Juno GL", authorHandle: "juno", description: "WebGL and GLSL components that stay at 60fps.", componentCount: 29, accent: "#6366f1" },
  { slug: "basis", name: "Basis", authorHandle: "basis", description: "Unstyled primitives with sensible defaults.", website: "basis.dev", componentCount: 29, accent: "#94a3b8" },
  { slug: "wren-micro", name: "Wren Micro", authorHandle: "wren", description: "Micro-interactions, cursors and hover states.", componentCount: 27, accent: "#e11d48" },
  { slug: "ember-editorial", name: "Ember Editorial", authorHandle: "ember", description: "Warm, print-inspired layouts for the web.", componentCount: 26, accent: "#b45309" },
  { slug: "noor-rtl", name: "Noor RTL", authorHandle: "noor", description: "RTL-first components with Arabic typography built in.", componentCount: 22, accent: "#059669" },
  // ── imported registries (MIT) ────────────────────────────────────────
  { slug: "magic-ui", name: "Magic UI", authorHandle: "magicui", description: "Animated components — beams, meteors, marquees, orbiting circles and text effects.", website: "magicui.design", componentCount: 78, accent: "#000000" },
  { slug: "kokonut-ui", name: "Kokonut UI", authorHandle: "kokonutui", description: "Modern animated components for AI interfaces, cards, inputs and layouts.", website: "kokonutui.com", componentCount: 46, accent: "#f97316" },
]

export const LIBRARY_MAP = new Map(LIBRARIES.map((l) => [l.slug, l]))
