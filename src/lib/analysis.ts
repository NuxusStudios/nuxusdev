/**
 * Mechanical quality checks over a component's source.
 *
 * Everything here is derived from the code itself — nothing is claimed that
 * can't be pointed at. The results drive the badges on component cards and the
 * filters in search, so a false positive is worse than a missed one: when a
 * check can't be decided from the source, it reports "unknown" rather than
 * guessing.
 */

export type Verdict = "pass" | "partial" | "fail" | "unknown"

export interface Analysis {
  /** adapts to the project's design tokens instead of hard-coding colours */
  themeable: Verdict
  /** respects prefers-reduced-motion, or doesn't animate at all */
  reducedMotion: Verdict
  /** interactive elements keep a visible focus indicator */
  focusVisible: Verdict
  /** counts that explain the verdicts */
  stats: {
    tokenClasses: number
    hardCodedColours: number
    animations: number
    interactiveElements: number
  }
}

/** Tailwind utilities that resolve to a theme variable. */
const TOKEN_CLASS =
  /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|shadow|accent|caret|placeholder)-(?:background|foreground|card|card-foreground|popover|popover-foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|border|input|ring)\b/g

/**
 * Colours baked into the component.
 *
 * Covers hex literals, rgb()/hsl()/oklch() literals, Tailwind's palette scale
 * (zinc-900, blue-500…) and the white/black keywords including opacity
 * modifiers, which is how most "dark-only" components are written.
 */
const HARD_COLOUR = new RegExp(
  [
    /#[0-9a-fA-F]{3,8}\b/.source,
    /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\([^)]*\)/.source,
    /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|divide|placeholder)-(?:white|black)(?:\/\d{1,3})?\b/
      .source,
    /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|shadow|divide|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?:\/\d{1,3})?\b/
      .source,
  ].join("|"),
  "g"
)

const ANIMATION =
  /\b(?:animate-(?!none)[a-z0-9-[\]_.%()]+|transition(?:-[a-z]+)?|@keyframes|motion\.[a-z]+|useSpring|useAnimate|animate=\{)/g
const REDUCED_MOTION = /prefers-reduced-motion|motion-safe:|motion-reduce:|useReducedMotion/
const INTERACTIVE = /<(?:button|a|input|select|textarea)\b|role="(?:button|link|tab|menuitem)"/g
const FOCUS_STYLE = /focus-visible:|focus:|focus-within:|outline-(?!none)|:focus/

export function analyse(source: string): Analysis {
  const tokenClasses = count(source, TOKEN_CLASS)
  const hardCodedColours = count(source, HARD_COLOUR)
  const animations = count(source, ANIMATION)
  const interactiveElements = count(source, INTERACTIVE)

  return {
    themeable: themeVerdict(tokenClasses, hardCodedColours),
    reducedMotion: motionVerdict(source, animations),
    focusVisible: focusVerdict(source, interactiveElements),
    stats: { tokenClasses, hardCodedColours, animations, interactiveElements },
  }
}

function themeVerdict(tokens: number, hard: number): Verdict {
  // a component with no colour references at all is trivially themeable
  if (tokens === 0 && hard === 0) return "pass"
  if (hard === 0) return "pass"
  if (tokens === 0) return "fail"
  // mixed: it will partly follow the theme and partly ignore it
  return tokens >= hard * 2 ? "partial" : "fail"
}

function motionVerdict(source: string, animations: number): Verdict {
  if (animations === 0) return "pass"
  return REDUCED_MOTION.test(source) ? "pass" : "fail"
}

function focusVerdict(source: string, interactive: number): Verdict {
  if (interactive === 0) return "unknown"
  if (!FOCUS_STYLE.test(source)) return "fail"
  // an explicit outline-none with nothing replacing it removes the indicator
  if (/outline-none/.test(source) && !/focus-visible:|:focus-visible/.test(source)) return "fail"
  return "pass"
}

function count(source: string, pattern: RegExp): number {
  return (source.match(new RegExp(pattern.source, pattern.flags)) ?? []).length
}
