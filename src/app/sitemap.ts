import type { MetadataRoute } from "next"
import { COMPONENTS } from "@/lib/data/components"
import { AUTHORS } from "@/lib/data/authors"
import { LIBRARIES } from "@/lib/data/libraries"
import { TAGS } from "@/lib/data/tags"
import { TEMPLATES } from "@/lib/data/templates"
import { POSTS } from "@/lib/data/posts"

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/pricing",
    "/templates",
    "/themes",
    "/icons",
    "/publish",
    "/blog",
    "/changelog",
    "/docs",
    "/bookmarks",
    "/design-bug-bot",
    "/contact",
    "/privacy",
    "/terms",
    "/community/components/featured",
    "/community/components/newest",
    "/community/authors",
    "/community/libraries",
    "/community/registries",
    "/community/shaders",
    "/community/gradients",
    "/community/ascii",
  ].map((path) => ({ url: `${BASE}${path}`, changeFrequency: "daily" as const, priority: path ? 0.7 : 1 }))

  return [
    ...staticRoutes,
    ...TAGS.filter((t) => !t.href).map((t) => ({
      url: `${BASE}/community/components/s/${t.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...COMPONENTS.map((c) => ({
      url: `${BASE}/@${c.authorHandle}/components/${c.slug}`,
      lastModified: new Date(c.updatedAt ?? c.createdAt),
      priority: 0.8,
    })),
    ...AUTHORS.map((a) => ({ url: `${BASE}/@${a.handle}`, priority: 0.5 })),
    ...LIBRARIES.map((l) => ({ url: `${BASE}/@${l.authorHandle}/library/${l.slug}`, priority: 0.5 })),
    ...TEMPLATES.map((t) => ({ url: `${BASE}/templates/${t.slug}`, priority: 0.7 })),
    ...POSTS.map((p) => ({ url: `${BASE}/blog/${p.slug}`, lastModified: new Date(p.date), priority: 0.5 })),
  ]
}
