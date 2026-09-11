/**
 * Requests every preview route and reports any that don't return 200, so a
 * broken import is caught here instead of as an empty card in the grid.
 *
 *   npm run registry:check                      # against localhost:3100
 *   PREVIEW_BASE=http://localhost:3000 npm run registry:check
 *   npm run registry:check http://localhost:3000
 */
import { COMPONENTS } from "../src/lib/data/components"

const base = process.argv[2] ?? process.env.PREVIEW_BASE ?? "http://localhost:3100"
const keys = [...new Set(COMPONENTS.map((component) => component.previewKey))]

const failures: { key: string; status: string }[] = []
let done = 0

async function check(key: string) {
  try {
    const response = await fetch(`${base}/preview/${key}`, { headers: { accept: "text/html" } })
    if (!response.ok) failures.push({ key, status: String(response.status) })
  } catch (error) {
    // a dev server compiles each route on first request; a connection error
    // here usually means the wrong port rather than a broken component
    failures.push({ key, status: error instanceof Error ? error.message : String(error) })
  }
  done++
  if (done % 25 === 0) console.log(`  ${done}/${keys.length}`)
}

// small pool: dev compiles each route on first request
const POOL = 3
let cursor = 0

console.log(`[previews] ${keys.length} routes against ${base}\n`)

// wrapped rather than top-level await: tsx transforms this to CJS, which
// cannot hold a top-level await
async function main() {
  await Promise.all(
    Array.from({ length: POOL }, async () => {
      while (cursor < keys.length) await check(keys[cursor++])
    })
  )

  console.log(`\nchecked ${keys.length} preview routes`)

  if (failures.length) {
    console.log(`FAILED ${failures.length}:`)
    for (const failure of failures) console.log(`   ${failure.status}  ${failure.key}`)
    process.exit(1)
  }

  console.log("all previews return 200")
}

void main()
