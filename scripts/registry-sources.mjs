/**
 * Public, MIT-licensed shadcn registries.
 *
 * These endpoints are the ones `npx shadcn add` itself fetches, so consuming
 * them is the documented use. Anything without a clear permissive license is
 * deliberately absent — Origin UI is AGPL-3.0 (copyleft, would infect this
 * project) and Tailark / Aceternity publish no LICENSE file.
 */
export const SOURCES = [
  {
    slug: "magic-ui",
    name: "Magic UI",
    homepage: "magicui.design",
    license: "MIT License",
    repo: "https://github.com/magicuidesign/magicui",
    author: {
      handle: "magicui",
      name: "Magic UI",
      bio: "150+ free and open-source animated components built with React, Tailwind and Motion.",
      website: "magicui.design",
      pro: true,
    },
    indexUrl: "https://magicui.design/r/registry.json",
    itemUrl: (name) => `https://magicui.design/r/${name}.json`,
    componentTypes: ["registry:ui"],
    /** Magic UI ships a matching example for most components */
    demoName: (name) => `${name}-demo`,
    /** source-tree prefixes that resolve to another registry file */
    localPrefixes: ["@/registry/magicui/", "@/registry/example/"],
  },
  {
    slug: "kokonut-ui",
    name: "Kokonut UI",
    homepage: "kokonutui.com",
    license: "MIT License",
    repo: "https://github.com/kokonut-labs/kokonutui",
    author: {
      handle: "kokonutui",
      name: "Kokonut UI",
      bio: "Ready-to-use React components for building modern, animated interfaces.",
      website: "kokonutui.com",
      pro: true,
    },
    indexUrl: "https://kokonutui.com/r/registry.json",
    itemUrl: (name) => `https://kokonutui.com/r/${name}.json`,
    componentTypes: ["registry:component"],
    demoName: null,
    localPrefixes: ["@/components/kokonutui/", "@/components/icons/", "@/hooks/"],
  },
]

/** shadcn/ui primitives (MIT) pulled in on demand when an import needs one. */
export const SHADCN_ITEM_URL = (name) =>
  `https://ui.shadcn.com/r/styles/new-york-v4/${name}.json`
