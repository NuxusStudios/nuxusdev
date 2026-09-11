/**
 * Builds a compact search index from the installed Iconify sets.
 *
 * The full icon data is ~40MB, far too much to ship to a browser. This emits a
 * name-and-keyword index only; the SVG for a given icon is fetched on demand
 * from an API route, so the client downloads a few kilobytes rather than
 * everything.
 */
import { writeFileSync, mkdirSync } from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

const SETS = [
  { id: "tabler", name: "Tabler", license: "MIT", url: "https://tabler.io/icons" },
  { id: "ph", name: "Phosphor", license: "MIT", url: "https://phosphoricons.com" },
  { id: "simple-icons", name: "Simple Icons", license: "CC0 1.0", url: "https://simpleicons.org" },
  { id: "ri", name: "Remix Icon", license: "Apache 2.0", url: "https://remixicon.com" },
  { id: "mdi", name: "Material Design Icons", license: "Apache 2.0", url: "https://pictogrammers.com/library/mdi" },
  { id: "heroicons", name: "Heroicons", license: "MIT", url: "https://heroicons.com" },
  { id: "lucide", name: "Lucide", license: "ISC", url: "https://lucide.dev" },
  { id: "bi", name: "Bootstrap Icons", license: "MIT", url: "https://icons.getbootstrap.com" },
]

const index = []
const sets = []

for (const set of SETS) {
  const data = require(`@iconify-json/${set.id}/icons.json`)
  const names = Object.keys(data.icons)

  // aliases are real icon names too, and often the ones people search for
  const aliases = Object.keys(data.aliases ?? {})
  const all = [...names, ...aliases]

  for (const name of all) {
    index.push(`${set.id}:${name}`)
  }

  sets.push({ ...set, count: all.length })
  console.log(`  ${set.name.padEnd(24)}${String(all.length).padStart(6)}`)
}

mkdirSync("src/lib/generated", { recursive: true })

writeFileSync(
  "src/lib/generated/icon-index.json",
  JSON.stringify({ sets, icons: index })
)

const total = index.length
console.log(`\n  ${total.toLocaleString()} icons indexed across ${sets.length} sets`)
console.log(`  index size: ${(JSON.stringify(index).length / 1024 / 1024).toFixed(1)} MB`)
