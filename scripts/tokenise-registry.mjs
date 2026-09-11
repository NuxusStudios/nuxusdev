#!/usr/bin/env node
/**
 * Rewrites hard-coded colours in our own registry components to theme tokens.
 *
 * The mapping is an identity in the default dark theme — `--foreground` is
 * near-white and `--background` near-black — so previews should look the same
 * afterwards, while finally responding to a theme that isn't ours.
 *
 * Only touches components we wrote. Imported registries are other people's MIT
 * code: rewriting them would change what the CLI installs and misrepresent the
 * upstream project.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const DIRS = ["src/registry/components", "src/registry/demos"]
const PREFIX = "(bg|text|border|ring|outline|from|via|to|shadow|divide|placeholder|fill|stroke|accent|caret|decoration)"

const RULES = [
  // white/black are the inverse of each other, exactly as foreground/background
  [new RegExp(`\\b${PREFIX}-white(/\\d{1,3})?\\b`, "g"), (_m, p, o = "") => `${p}-foreground${o}`],
  [new RegExp(`\\b${PREFIX}-black(/\\d{1,3})?\\b`, "g"), (_m, p, o = "") => `${p}-background${o}`],
  // the neutral surfaces this catalogue happens to use
  [new RegExp(`\\b${PREFIX}-(?:zinc|neutral|slate|gray|stone)-9(?:5\\d|00)(/\\d{1,3})?\\b`, "g"), (_m, p, o = "") => `${p}-background${o}`],
  [new RegExp(`\\b${PREFIX}-(?:zinc|neutral|slate|gray|stone)-(?:8\\d\\d)(/\\d{1,3})?\\b`, "g"), (_m, p, o = "") => `${p}-card${o}`],
  [new RegExp(`\\b${PREFIX}-(?:zinc|neutral|slate|gray|stone)-(?:50|100)(/\\d{1,3})?\\b`, "g"), (_m, p, o = "") => `${p}-foreground${o}`],
]

/**
 * Arbitrary values like `bg-[#0c0c10]` are surfaces when they're neutral and
 * near-black or near-white. A saturated hex is a deliberate accent — a brand
 * purple, a gradient stop — and is left exactly as the author wrote it.
 */
function neutralToken(prefix, hex) {
  const full = hex.length === 4
    ? hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
    : hex.slice(1, 7)
  if (full.length !== 6) return null

  const r = parseInt(full.slice(0, 2), 16)
  const g = parseInt(full.slice(2, 4), 16)
  const b = parseInt(full.slice(4, 6), 16)

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max - min > 24) return null // saturated: an accent, not a surface

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  if (luminance < 0.22) {
    // a dark neutral is the surface a card sits on
    if (prefix === "bg") return "bg-card"
    if (prefix === "text") return "text-background"
    if (prefix === "border" || prefix === "ring" || prefix === "outline") return `${prefix}-border`
    return null
  }

  if (luminance > 0.85) {
    if (prefix === "text") return "text-foreground"
    if (prefix === "bg") return "bg-foreground"
    return null
  }

  return null
}

let filesChanged = 0
let replacements = 0

for (const dir of DIRS) {
  for (const name of readdirSync(join(process.cwd(), dir))) {
    if (!name.endsWith(".tsx")) continue

    const path = join(process.cwd(), dir, name)
    const before = readFileSync(path, "utf8")
    let after = before

    for (const [pattern, replace] of RULES) {
      after = after.replace(pattern, (...args) => {
        replacements++
        return replace(...args)
      })
    }

    after = after.replace(
      new RegExp(`\\b${PREFIX}-\\[(#[0-9a-fA-F]{3,8})\\]`, "g"),
      (match, prefix, hex) => {
        const token = neutralToken(prefix, hex)
        if (!token) return match
        replacements++
        return token
      }
    )

    if (after !== before) {
      writeFileSync(path, after)
      filesChanged++
    }
  }
}

console.log(`[tokenise] ${replacements} replacements across ${filesChanged} files`)
