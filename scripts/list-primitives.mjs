import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { SOURCES } from "./registry-sources.mjs"

const CACHE = path.join(process.cwd(), ".import-cache")
const need = new Map()
const bad = new Map()

for (const source of SOURCES) {
  const dir = path.join(CACHE, source.slug)
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".json") && f !== "_index.json")) {
    const item = JSON.parse(await readFile(path.join(dir, file), "utf8"))
    for (const f of item.files ?? []) {
      for (const m of (f.content ?? "").matchAll(/from\s+["']@\/components\/ui\/([^"']+)["']/g)) {
        need.set(m[1], (need.get(m[1]) ?? 0) + 1)
      }
      for (const m of (f.content ?? "").matchAll(/from\s+["']@\/app\/[^"']+["']/g)) {
        bad.set(item.name, (bad.get(item.name) ?? 0) + 1)
      }
    }
  }
}
console.log("shadcn primitives needed:")
for (const [k, v] of [...need].sort((a, b) => b[1] - a[1])) console.log(String(v).padStart(3), k)
console.log("\nitems importing app routes (unimportable):", [...bad.keys()].join(", ") || "none")
