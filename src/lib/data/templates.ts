import type { TemplateRecord } from "@/lib/types"

export const TEMPLATES: TemplateRecord[] = [
  {
    id: "t-001",
    slug: "saas-landing",
    name: "SaaS Landing",
    description:
      "A complete marketing page — animated hero, logo marquee, bento features, pricing and footer, all sharing one set of tokens.",
    authorHandle: "vantage",
    price: 0,
    tags: ["hero", "pricing-section", "features", "footer"],
    previewKey: "saas-landing",
    pages: 5,
    bookmarks: 1840,
    demoUrl: "saas.vantage.build",
  },
  {
    id: "t-002",
    slug: "analytics-dashboard",
    name: "Analytics Dashboard",
    description:
      "Sidebar app shell with KPI tiles, sparklines, a sortable customer table and live status — the skeleton of a real product.",
    authorHandle: "orbit",
    price: 49,
    tags: ["dashboard", "table", "stat", "sidebar"],
    previewKey: "analytics-dashboard",
    pages: 8,
    bookmarks: 1210,
    demoUrl: "app.orbitui.com",
  },
  {
    id: "t-003",
    slug: "waitlist",
    name: "Waitlist",
    description:
      "One-screen launch page with an animated mesh backdrop, typewriter headline and social proof under the form.",
    authorHandle: "juno",
    price: 0,
    tags: ["hero", "form", "gradients"],
    previewKey: "waitlist",
    pages: 2,
    bookmarks: 2360,
  },
  {
    id: "t-004",
    slug: "agency",
    name: "Agency",
    description:
      "Studio site with an aurora hero, animated stats band, scrolling testimonials and an FAQ that answers the real questions.",
    authorHandle: "lumen",
    price: 39,
    tags: ["hero", "testimonials", "faq", "stat"],
    previewKey: "agency",
    pages: 6,
    bookmarks: 940,
    demoUrl: "agency.lumen.studio",
  },
]

export const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.slug, t]))
