/**
 * Parses a pasted shadcn-style stylesheet into a set of CSS custom properties.
 *
 * The result is injected into the preview iframe as a <style> block, so this is
 * a trust boundary: user input is never evaluated, and every value has to match
 * a conservative whitelist before it is allowed through. Anything unexpected is
 * dropped rather than sanitised, because a half-understood value is exactly
 * where escapes hide.
 */

/** Custom properties we render; anything else in the paste is ignored. */
export const THEME_VARS = [
  "--background",
  "--foreground",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--primary",
  "--primary-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--accent",
  "--accent-foreground",
  "--destructive",
  "--destructive-foreground",
  "--border",
  "--input",
  "--ring",
  "--radius",
] as const

export type ThemeVar = (typeof THEME_VARS)[number]

const ALLOWED = new Set<string>(THEME_VARS)

/**
 * Colours, lengths and bare numbers only.
 *
 * Deliberately excludes url(), var(), attr(), image-set() and anything with a
 * quote, semicolon, brace or comment marker — none of which a theme token
 * needs, and all of which are how CSS injection works.
 */
const VALUE = /^[a-zA-Z0-9#%.,()/\s+\-*]+$/
const FUNCTION = /\b([a-z-]+)\s*\(/gi
const SAFE_FUNCTIONS = new Set([
  "rgb", "rgba", "hsl", "hsla", "oklch", "oklab", "lab", "lch", "color",
  "calc", "min", "max", "clamp", "color-mix", "from",
])

export function isSafeValue(raw: string): boolean {
  const value = raw.trim()
  if (!value || value.length > 120) return false
  if (!VALUE.test(value)) return false

  // balanced parens, and only functions we recognise
  let depth = 0
  for (const char of value) {
    if (char === "(") depth++
    else if (char === ")" && --depth < 0) return false
  }
  if (depth !== 0) return false

  for (const match of value.matchAll(FUNCTION)) {
    if (!SAFE_FUNCTIONS.has(match[1].toLowerCase())) return false
  }

  return true
}

/**
 * Tailwind v4 exposes theme colours as `--color-background`; shadcn's own
 * stylesheets use `--background`. Both spellings mean the same token, so they
 * are normalised on the way in and emitted on the way out.
 */
function normalise(name: string): string {
  return name.startsWith("--color-") ? `--${name.slice("--color-".length)}` : name
}

export interface ParsedTheme {
  light: Record<string, string>
  dark: Record<string, string>
  /** properties found in the paste that we don't render */
  ignored: string[]
}

/** Pulls `--name: value;` pairs out of the :root and .dark blocks. */
export function parseThemeCss(css: string): ParsedTheme {
  const source = css.slice(0, 200_000)
  const light: Record<string, string> = {}
  const dark: Record<string, string> = {}
  const ignored = new Set<string>()

  // block-scoped so ":root" and ".dark" don't bleed into one another; anything
  // outside a recognised selector is read as light, which is the common case
  // for a paste of just the variable list
  const blocks = splitBlocks(source)

  for (const block of blocks) {
    const target = block.selector.includes(".dark") ? dark : light

    for (const [name, value] of readDeclarations(block.body)) {
      if (!ALLOWED.has(name)) {
        ignored.add(name)
        continue
      }
      if (!isSafeValue(value)) continue
      target[name] = value.trim()
    }
  }

  return { light, dark, ignored: [...ignored].sort() }
}

interface Block {
  selector: string
  body: string
}

function splitBlocks(css: string): Block[] {
  const blocks: Block[] = []
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "")

  const pattern = /([^{}]*)\{([^{}]*)\}/g
  let match: RegExpExecArray | null
  let matched = false

  while ((match = pattern.exec(withoutComments))) {
    matched = true
    blocks.push({ selector: match[1].trim(), body: match[2] })
  }

  // a bare list of declarations with no selector at all
  if (!matched) blocks.push({ selector: ":root", body: withoutComments })

  return blocks
}

function* readDeclarations(body: string): Generator<[string, string]> {
  for (const declaration of body.split(";")) {
    const index = declaration.indexOf(":")
    if (index === -1) continue

    const name = declaration.slice(0, index).trim()
    if (!name.startsWith("--")) continue

    yield [normalise(name), declaration.slice(index + 1)]
  }
}

/**
 * Renders a parsed theme back into CSS for injection into the preview.
 *
 * Selectors are qualified with `:root` so they out-specify the stylesheet's own
 * `.dark` block — a bare `:root` ties with `.dark` and would lose or win
 * depending on document order, which is not something to leave to chance.
 */
export function renderThemeCss(theme: { light: Record<string, string>; dark: Record<string, string> }): string {
  const rules: string[] = []

  const light = declarations(theme.light)
  if (light) rules.push(`:root,:root.light{${light}}`)

  // a theme with only one palette applies in both modes — the user gave us one
  // set of brand colours, not a light variant
  const dark = declarations(theme.dark) || light
  if (dark) rules.push(`:root.dark,:root[data-theme="dark"]{${dark}}`)

  return rules.join("")
}

function declarations(vars: Record<string, string>): string {
  return Object.entries(vars)
    .filter(([name, value]) => ALLOWED.has(name) && isSafeValue(value))
    .flatMap(([name, value]) => {
      const trimmed = value.trim()
      // --radius isn't a colour, so it has no --color- counterpart
      if (name === "--radius") return [`${name}:${trimmed}`]
      return [`${name}:${trimmed}`, `--color-${name.slice(2)}:${trimmed}`]
    })
    .join(";")
}
