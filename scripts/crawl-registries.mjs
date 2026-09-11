#!/usr/bin/env node
/**
 * Walks every registry in the shadcn index and records what each one publishes.
 *
 * This is what makes search useful beyond our own catalogue: an agent asking
 * for a pricing table should get the best answer in the ecosystem, not just
 * the best answer we happen to host.
 *
 * Only metadata is stored — name, description, categories, dependencies and
 * the install URL. Source is never copied: the CLI fetches it from the origin
 * registry, so authors keep their traffic, their licence and their attribution.
 *
 *   node scripts/crawl-registries.mjs            # all healthy registries
 *   node scripts/crawl-registries.mjs --limit 20 # a sample, for development
 */
import { writeFileSync } from "node:fs"
import { REGISTRIES } from "../src/lib/data/registries.ts"

const LIMIT = Number(process.argv[process.argv.indexOf("--limit") + 1]) || Infinity
const CONCURRENCY = 6
const TIMEOUT_MS = 12_000
const OUT = "src/lib/data/registry-items.json"

/** Item types worth indexing; styles and themes aren't components. */
const TYPES = new Set([
  "registry:ui",
  "registry:component",
  "registry:block",
  "registry:hook",
  "registry:lib",
])

/** Derives the site root from a "https://x.com/r/{name}.json" template. */
function baseOf(template) {
  try {
    const url = new URL(template.replace("{name}", "__probe__"))
    // drop the filename and any /r/ directory the template points into
    const segments = url.pathname.split("/").filter(Boolean)
    segments.pop()
    if (segments[segments.length - 1] === "r") segments.pop()
    return `${url.origin}${segments.length ? "/" + segments.join("/") : ""}`
  } catch {
    return null
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { accept: "application/json", "user-agent": "NuxusRegistryIndex/1.0 (+https://nuxus.dev)" },
  })
  if (!response.ok) return null

  // a SPA happily 200s on an unknown path and hands back its HTML shell
  const type = response.headers.get("content-type") ?? ""
  if (!type.includes("json")) return null

  try {
    return await response.json()
  } catch {
    return null
  }
}

async function crawl(registry) {
  const base = baseOf(registry.url)
  if (!base) return null

  for (const path of ["/r/registry.json", "/registry.json"]) {
    const payload = await fetchJson(`${base}${path}`).catch(() => null)
    if (!payload || !Array.isArray(payload.items)) continue

    const items = payload.items
      .filter((item) => item?.name && (!item.type || TYPES.has(item.type)))
      .map((item) => ({
        name: item.name,
        title: item.title ?? null,
        description: (item.description ?? "").trim().slice(0, 400) || null,
        type: item.type ?? "registry:ui",
        categories: Array.isArray(item.categories) ? item.categories.slice(0, 8) : [],
        dependencies: Array.isArray(item.dependencies) ? item.dependencies.slice(0, 12) : [],
      }))

    if (items.length === 0) continue

    return {
      namespace: registry.namespace,
      homepage: payload.homepage ?? registry.homepage,
      install: registry.url,
      status: registry.status,
      items,
    }
  }

  return null
}

const candidates = REGISTRIES.filter((r) => r.status !== "unavailable").slice(0, LIMIT)
console.log(`[crawl] ${candidates.length} registries, ${CONCURRENCY} at a time\n`)

const results = []
let done = 0
let failed = 0

const queue = candidates.slice()
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const registry = queue.shift()
      const result = await crawl(registry).catch(() => null)

      done++
      if (result) results.push(result)
      else failed++

      if (done % 25 === 0) console.log(`  ${done}/${candidates.length}  (${results.length} indexed)`)
    }
  })
)

results.sort((a, b) => b.items.length - a.items.length)
const total = results.reduce((sum, r) => sum + r.items.length, 0)

/**
 * Written in a columnar shape with short keys.
 *
 * The obvious `[{namespace, name, title, …}, …]` repeats every key 37,000
 * times. Hoisting the registry out and flattening each item to a tuple takes
 * the file from 8.4MB to something a shared host can hold in memory.
 *
 * Tuple order: name, title, description, type, categories.
 */
const compact = {
  crawledAt: new Date().toISOString(),
  registries: results.map((registry) => ({
    ns: registry.namespace,
    home: registry.homepage,
    install: registry.install,
    status: registry.status,
    items: registry.items.map((item) => [
      item.name,
      item.title && item.title !== item.name ? item.title : "",
      item.description ? item.description.slice(0, 180) : "",
      item.type === "registry:ui" ? "" : item.type.replace("registry:", ""),
      item.categories.join(","),
    ]),
  })),
}

writeFileSync(OUT, JSON.stringify(compact) + "\n")

console.log(`\n[crawl] ${total} items from ${results.length} registries`)
console.log(`[crawl] ${failed} published no readable index`)
console.log(`[crawl] wrote ${OUT}`)
