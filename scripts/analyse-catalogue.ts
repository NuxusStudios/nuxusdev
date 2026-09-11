/**
 * Runs the quality checks over every component in the catalogue and writes the
 * results to src/lib/data/analysis.json, which the UI reads.
 *
 * Re-run with `npm run analyse` after adding or editing components.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { analyse, type Analysis } from "../src/lib/analysis"
import { COMPONENTS } from "../src/lib/data/components"

const ROOTS = ["src/registry/components", "src/registry/imported/components"]
const DEMOS = ["src/registry/demos", "src/registry/imported/demos"]

function read(dirs: string[], key: string): string | null {
  for (const dir of dirs) {
    const path = join(process.cwd(), dir, `${key}.tsx`)
    if (existsSync(path)) return readFileSync(path, "utf8")
  }
  return null
}

const results: Record<string, Analysis> = {}
const missing: string[] = []

for (const component of COMPONENTS) {
  const source = read(ROOTS, component.previewKey)
  const demo = read(DEMOS, component.previewKey)

  if (!source && !demo) {
    missing.push(component.previewKey)
    continue
  }

  // the demo is what people see, and it carries most of the colour decisions,
  // so both are analysed together
  results[component.id] = analyse([source, demo].filter(Boolean).join("\n"))
}

writeFileSync("src/lib/data/analysis.json", JSON.stringify(results, null, 0) + "\n")

const tally = (key: "themeable" | "reducedMotion" | "focusVisible") => {
  const counts = { pass: 0, partial: 0, fail: 0, unknown: 0 }
  for (const result of Object.values(results)) counts[result[key]]++
  return counts
}

console.log(`analysed ${Object.keys(results).length} components` + (missing.length ? `, ${missing.length} source files not found` : ""))
for (const key of ["themeable", "reducedMotion", "focusVisible"] as const) {
  const t = tally(key)
  console.log(`  ${key.padEnd(14)} pass ${t.pass}  partial ${t.partial}  fail ${t.fail}  unknown ${t.unknown}`)
}
if (missing.length) console.log(`  missing: ${missing.slice(0, 8).join(", ")}${missing.length > 8 ? "…" : ""}`)
