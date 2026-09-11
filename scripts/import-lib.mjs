/** Shared helpers for the registry import. */

export const RESERVED = new Set() // filled by the importer with existing local keys

/** kebab-case name → PascalCase */
export const pascal = (name) =>
  name.replace(/(^|[-_])([a-z0-9])/g, (_, __, c) => c.toUpperCase()).replace(/[-_]/g, "")

/** "bento-grid" → "Bento Grid" */
export const humanize = (name) =>
  name
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bUi\b/g, "UI")
    .replace(/\bAi\b/g, "AI")
    .replace(/\b3d\b/gi, "3D")
    .replace(/\bSvg\b/g, "SVG")

/** deterministic 32-bit hash so generated numbers are stable across runs */
export function hash(input) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * Keyword → category rules, checked against the component name and description.
 * First match wins for the primary tag; every match is kept as a secondary.
 */
const RULES = [
  [/marquee|ticker-tape|scroll(ing)?-(logos|list)/, "marquee"],
  [/\bhero\b/, "hero"],
  [/bento/, "grid"],
  [/\bdock\b/, "dock"],
  [/globe|world-?map|map\b/, "globe"],
  [/orbit|meteor|particle|beam|ripple|grid-pattern|dot-pattern|retro-grid|warp|flickering|animated-grid|aurora|plasma|shader|noise|grain/, "background"],
  [/gradient/, "gradients"],
  [/confetti|sparkle|magic-card|border-beam|shine-border|neon|glow/, "border"],
  [/terminal|code-(block|comparison|snippet)|script-copy/, "text"],
  [/\bavatar\b|profile/, "avatar"],
  [/\bbadge\b|\bchip\b|\btag\b/, "badge"],
  [/\bbutton\b|\bbtn\b/, "button"],
  [/\bcard\b/, "card"],
  [/carousel|slider-cards|swipe/, "carousel"],
  [/\bcalendar\b|date-?picker/, "calendar"],
  [/chart|graph|data-?viz|sparkline/, "data-visualization"],
  [/checkbox/, "checkbox"],
  [/cursor|pointer/, "cursor"],
  [/dashboard/, "dashboard"],
  [/dialog|modal|drawer|sheet/, "modal"],
  [/dropdown|select\b/, "dropdown"],
  [/empty-?state/, "empty-state"],
  [/file-?tree/, "file-tree"],
  [/upload|download|file-/, "upload-download"],
  [/\bform\b|\binput\b|prompt\b|textarea|search-?bar/, "input"],
  [/\bicon(s)?\b|logo/, "icon"],
  [/\blist\b|feed/, "list"],
  [/\bmenu\b|navbar|navigation|nav-/, "navigation-menu"],
  [/notification|toast|alert/, "notification"],
  [/number|counting|count-?up/, "number"],
  [/onboarding|tour|stepper|steps/, "steps"],
  [/pagination/, "pagination"],
  [/\bpopover\b|tooltip|hover-card/, "tooltip"],
  [/pricing/, "pricing-section"],
  [/progress/, "progress"],
  [/rating|star/, "badge"],
  [/sidebar/, "sidebar"],
  [/sign-?in|login/, "sign-in"],
  [/sign-?up|register/, "sign-up"],
  [/spinner|loading|loader|skeleton/, "spinner"],
  [/\btable\b/, "table"],
  [/\btabs?\b/, "tabs"],
  [/testimonial|review|tweet/, "testimonials"],
  [/timeline/, "timeline"],
  [/toggle|switch/, "toggle"],
  [/\btext\b|typing|typewriter|word|letter|blur-fade|morph|shimmer|reveal|highlight|flip-?text|sparkles-text|box-reveal|line-shadow|aurora-text|spinning-text/, "text"],
  [/video|player/, "video"],
  [/team/, "team"],
  [/faq|accordion/, "accordion"],
  [/footer/, "footer"],
  [/feature/, "features"],
  [/\bcta\b|call-to-action|get-started/, "cta"],
  [/\bai\b|chat|assistant|agent|model/, "ai-chat"],
  [/image|photo|gallery|lens|comparison/, "image"],
  [/\bmodal\b|command/, "menu"],
  [/currency|payment|transfer|wallet|card-flip/, "card"],
]

export function categorize(name, description = "", fallback = "card") {
  const haystack = `${name} ${description}`.toLowerCase()
  const tags = []
  for (const [pattern, tag] of RULES) {
    if (pattern.test(haystack) && !tags.includes(tag)) tags.push(tag)
  }
  if (!tags.length) tags.push(fallback)
  return tags.slice(0, 4)
}

/** Files that use hooks or browser APIs must opt into the client boundary. */
export function ensureClientDirective(code) {
  if (/^\s*["']use client["']/.test(code)) return code
  const needsClient =
    /\buse(State|Effect|Ref|Memo|Callback|Context|Reducer|LayoutEffect|Id|Transition|SyncExternalStore)\s*[(<]/.test(code) ||
    /from\s+["']motion\//.test(code) ||
    /from\s+["']framer-motion["']/.test(code) ||
    /\bwindow\.|\bdocument\./.test(code) ||
    /onClick=|onChange=|onMouseMove=|onSubmit=/.test(code)
  return needsClient ? `"use client"\n\n${code}` : code
}
