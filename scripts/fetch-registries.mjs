/**
 * Downloads every registry item into .import-cache/ so the rest of the import
 * runs offline. Polite: 4 concurrent requests, retries on 429 with backoff.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { SOURCES } from "./registry-sources.mjs"

const CACHE = path.join(process.cwd(), ".import-cache")
const UA = "21st-clone-importer (shadcn registry consumer)"

async function getJson(url, { retries = 3 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: { "user-agent": UA, accept: "application/json" } })
    if (res.status === 429 || res.status >= 500) {
      const wait = 1200 * (attempt + 1)
      await new Promise((r) => setTimeout(r, wait))
      continue
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`)
    return res.json()
  }
  throw new Error(`gave up on ${url}`)
}

async function pool(items, limit, worker) {
  const results = []
  let cursor = 0
  const runners = Array.from({ length: limit }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      try {
        results[index] = await worker(items[index], index)
      } catch (error) {
        results[index] = { __error: String(error) }
      }
      await new Promise((r) => setTimeout(r, 120))
    }
  })
  await Promise.all(runners)
  return results
}

for (const source of SOURCES) {
  const dir = path.join(CACHE, source.slug)
  await mkdir(dir, { recursive: true })

  const indexPath = path.join(dir, "_index.json")
  let index
  if (existsSync(indexPath)) {
    index = JSON.parse(await readFile(indexPath, "utf8"))
  } else {
    index = await getJson(source.indexUrl)
    await writeFile(indexPath, JSON.stringify(index, null, 2))
  }

  const items = index.items ?? index
  const wanted = new Set()
  for (const item of items) {
    if (!source.componentTypes.includes(item.type)) continue
    wanted.add(item.name)
    if (source.demoName) wanted.add(source.demoName(item.name))
  }

  const names = [...wanted]
  let fetched = 0
  let missing = 0

  await pool(names, 4, async (name) => {
    const file = path.join(dir, `${name}.json`)
    if (existsSync(file)) return
    try {
      const data = await getJson(source.itemUrl(name))
      await writeFile(file, JSON.stringify(data, null, 2))
      fetched++
    } catch {
      missing++ // demos don't exist for every component
    }
  })

  console.log(
    `${source.name}: ${items.length} index entries · ${names.length} targets · ${fetched} fetched · ${missing} unavailable`
  )
}
