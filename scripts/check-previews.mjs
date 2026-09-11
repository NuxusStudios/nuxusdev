/**
 * Requests every preview route and reports any that don't return 200, so a
 * broken import is caught here instead of as an empty card in the grid.
 */
import { readFile } from "node:fs/promises"
import path from "node:path"

const base = process.argv[2] ?? "http://localhost:3100"
const ROOT = process.cwd()

const imported = JSON.parse(await readFile(path.join(ROOT, ".import-cache/result.json"), "utf8"))
const keys = imported.records.map((r) => r.previewKey)

const failures = []
let done = 0

async function check(key) {
  try {
    const res = await fetch(`${base}/preview/${key}`, { headers: { accept: "text/html" } })
    if (!res.ok) failures.push({ key, status: res.status })
  } catch (error) {
    failures.push({ key, status: String(error) })
  }
  done++
  if (done % 25 === 0) process.stdout.write(`  ${done}/${keys.length}\n`)
}

// small pool: dev compiles each route on first request
const POOL = 3
let cursor = 0
await Promise.all(
  Array.from({ length: POOL }, async () => {
    while (cursor < keys.length) await check(keys[cursor++])
  })
)

console.log(`\nchecked ${keys.length} preview routes`)
if (failures.length) {
  console.log(`FAILED ${failures.length}:`)
  for (const f of failures) console.log(`   ${f.status}  ${f.key}`)
} else {
  console.log("all previews return 200")
}
