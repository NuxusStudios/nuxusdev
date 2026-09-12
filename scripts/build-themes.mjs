#!/usr/bin/env node
/**
 * Generates src/lib/data/themes.ts.
 *
 * A theme is authored as six hex swatches — the same six shown on its card —
 * and the full token set is derived from them here. That way the swatch and
 * the CSS cannot disagree, and every theme ships a complete set rather than
 * the four tokens the catalogue used to carry, which left cards, borders and
 * muted text at the site default whenever a theme was applied.
 *
 * A theme whose text would not be readable is a failure, not a warning.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { hexToOklch, contrast, blendUntilReadable } from "./lib/color.mjs"

const EXISTING = JSON.parse(
  readFileSync(
    "/private/tmp/claude-502/-Users-abdellah-Documents-Claude-Work-Folder/218c0779-fda4-4d70-ba5b-422b72df4761/scratchpad/existing-themes.json",
    "utf8"
  )
)

/** slug, name, author, description, radius, font, and the six swatches. */
const NEW = [
  ["obsidian-rose", "Obsidian Rose", "sable", "Near-black surfaces with a rose accent that only shows up where it matters.", "0.75rem", "Instrument Sans", { background: "#0b0a0c", card: "#151317", primary: "#f43f5e", accent: "#1f1c22", border: "#2a262e", foreground: "#f5f3f5" }],
  ["deep-sea", "Deep Sea", "juno", "Navy depths with a cyan light source. Built for dashboards that run all night.", "0.5rem", "Geist", { background: "#071016", card: "#0e1b24", primary: "#22d3ee", accent: "#14242e", border: "#1c3240", foreground: "#e8f4f8" }],
  ["carbon-lime", "Carbon Lime", "flux", "Charcoal and acid lime — loud in one place, silent everywhere else.", "0.375rem", "JetBrains Mono", { background: "#0c0d0a", card: "#16180f", primary: "#a3e635", accent: "#1e2116", border: "#2a2e1f", foreground: "#f2f4ec" }],
  ["plum-noir", "Plum Noir", "lumen", "Violet-tinted darkness with a soft orchid accent. Editorial, not neon.", "0.875rem", "General Sans", { background: "#0e0a12", card: "#18111e", primary: "#c084fc", accent: "#221829", border: "#2e2136", foreground: "#f3eef7" }],
  ["ember", "Ember", "solstice", "Warm dark browns lit by a single orange. Reads like a terminal at dusk.", "0.5rem", "Geist Mono", { background: "#100b08", card: "#1b120d", primary: "#fb923c", accent: "#261a12", border: "#33241a", foreground: "#f7f0ea" }],
  ["forest-floor", "Forest Floor", "meridian", "Deep green ground with a mint accent. Calm without going grey.", "0.625rem", "Inter", { background: "#080d0a", card: "#101711", primary: "#34d399", accent: "#16211a", border: "#1f2d24", foreground: "#ecf3ee" }],
  ["slate-ice", "Slate Ice", "cobalt", "Blue-grey surfaces and an ice accent. The quiet end of dark mode.", "0.65rem", "Inter", { background: "#0a0d12", card: "#131821", primary: "#7dd3fc", accent: "#1a212c", border: "#242c39", foreground: "#eef2f7" }],
  ["oxblood", "Oxblood", "ember", "Dark red-brown with a muted coral. Serious, with one raised voice.", "0.375rem", "Newsreader", { background: "#0f0809", card: "#1a0f11", primary: "#f87171", accent: "#251517", border: "#321d20", foreground: "#f6eeef" }],
  ["linen", "Linen", "ember", "Warm off-white paper and a terracotta accent. Built for long reading.", "0.375rem", "Newsreader", { background: "#faf7f2", card: "#ffffff", primary: "#c2410c", accent: "#f0e9df", border: "#e2d9cc", foreground: "#1c1917" }],
  ["porcelain", "Porcelain", "arc", "Cool white with a confident navy. The default for something people pay for.", "0.5rem", "Inter", { background: "#f7f9fc", card: "#ffffff", primary: "#1d4ed8", accent: "#eaeff7", border: "#d8e0ec", foreground: "#0f172a" }],
  ["meadow", "Meadow", "meridian", "Pale green light and a forest accent. Soft without being washed out.", "0.75rem", "Geist", { background: "#f6faf6", card: "#ffffff", primary: "#15803d", accent: "#e7f2e9", border: "#d4e6d8", foreground: "#14211a" }],
  ["sandstone", "Sandstone", "solstice", "Sand and umber. Warm enough to read outside, quiet enough for a document.", "0.5rem", "Newsreader", { background: "#faf6ef", card: "#fffdf8", primary: "#92400e", accent: "#f1e8da", border: "#e3d7c3", foreground: "#231c12" }],
  ["drafting-table", "Drafting Table", "orbit", "Drafting-paper grey with an engineering blue. For tools, not marketing.", "0.25rem", "JetBrains Mono", { background: "#f4f7fa", card: "#ffffff", primary: "#0369a1", accent: "#e6eef5", border: "#d2dfea", foreground: "#0c1a26" }],
  ["sorbet", "Sorbet", "wren", "The lightest possible pink with a magenta accent. Cheerful, still legible.", "1rem", "General Sans", { background: "#fff7f8", card: "#ffffff", primary: "#db2777", accent: "#fdeaf0", border: "#f7d8e3", foreground: "#27141b" }],
]

/** Derives the whole token set from the six swatches. */
function tokens(c, radius) {
  // white or black on the primary, whichever is actually readable
  const primaryForeground =
    contrast("#ffffff", c.primary) >= contrast("#0a0a0a", c.primary) ? "#ffffff" : "#0a0a0a"

  // as close to the background as it can sit and still clear 4.5:1
  const mutedForeground = blendUntilReadable(c.foreground, c.background, c.background)

  const set = {
    "--background": c.background,
    "--foreground": c.foreground,
    "--card": c.card,
    "--card-foreground": c.foreground,
    "--popover": c.card,
    "--popover-foreground": c.foreground,
    "--primary": c.primary,
    "--primary-foreground": primaryForeground,
    "--secondary": c.accent,
    "--secondary-foreground": c.foreground,
    "--muted": c.accent,
    "--muted-foreground": mutedForeground,
    "--accent": c.accent,
    "--accent-foreground": c.foreground,
    "--border": c.border,
    "--input": c.border,
    "--ring": c.primary,
  }

  return {
    css: Object.fromEntries(
      Object.entries(set).map(([k, v]) => [k, hexToOklch(v)]).concat([["--radius", radius]])
    ),
    checks: {
      bodyText: contrast(c.foreground, c.background),
      onCard: contrast(c.foreground, c.card),
      mutedText: contrast(mutedForeground, c.background),
      onPrimary: contrast(primaryForeground, c.primary),
    },
  }
}

const all = [
  ...EXISTING.map((t) => ({ ...t, colors: t.colors })),
  ...NEW.map(([slug, name, author, description, radius, font, colors]) => ({
    slug, name, author, description, radius, font, bookmarks: 0, colors,
  })),
]

// a duplicate slug silently shadows a theme in THEME_MAP and breaks its page,
// so it fails the build rather than the site
const seen = new Set()
const duplicates = all.map((t) => t.slug).filter((slug) => {
  if (seen.has(slug)) return true
  seen.add(slug)
  return false
})

if (duplicates.length) {
  console.error(`[themes] duplicate slugs: ${[...new Set(duplicates)].join(", ")}`)
  process.exit(1)
}

const failures = []
const records = all.map((theme, index) => {
  const { css, checks } = tokens(theme.colors, theme.radius)

  for (const [label, ratio] of Object.entries(checks)) {
    if (ratio < 4.5) failures.push(`${theme.slug}: ${label} ${ratio.toFixed(2)}:1`)
  }

  const order = ["background", "card", "primary", "accent", "border", "foreground"]
  return `  {
    id: "th-${String(index + 1).padStart(3, "0")}",
    slug: ${JSON.stringify(theme.slug)},
    name: ${JSON.stringify(theme.name)},
    authorHandle: ${JSON.stringify(theme.author)},
    description: ${JSON.stringify(theme.description)},
    radius: ${JSON.stringify(theme.radius)},
    font: ${JSON.stringify(theme.font)},
    bookmarks: ${theme.bookmarks},
    colors: [
${order.map((k) => `      { name: ${JSON.stringify(k)}, value: ${JSON.stringify(theme.colors[k])} },`).join("\n")}
    ],
    cssVars: {
${Object.entries(css).map(([k, v]) => `      ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join("\n")}
    },
  },`
})

if (failures.length) {
  console.error(`[themes] ${failures.length} contrast failures:`)
  for (const f of failures) console.error(`   ${f}`)
  process.exit(1)
}

writeFileSync(
  "src/lib/data/themes.ts",
  `import type { ThemeRecord } from "@/lib/types"

// Generated by scripts/build-themes.mjs — edit the palettes there, not here.
// Every theme carries the full token set, derived from its own six swatches,
// and every one clears 4.5:1 on body text, card text, muted text and the
// primary. A theme that cannot be read is not shipped.

export const THEMES: ThemeRecord[] = [
${records.join("\n")}
]

export const THEME_MAP = new Map(THEMES.map((t) => [t.slug, t]))
`
)

console.log(`[themes] ${records.length} themes written, all clearing 4.5:1`)
