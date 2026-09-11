import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { SOURCES } from "./registry-sources.mjs"

const CACHE = path.join(process.cwd(), ".import-cache")
const npm = new Map()
const alias = new Map()
const filesPerItem = []

for (const source of SOURCES) {
  const dir = path.join(CACHE, source.slug)
  const names = (await readdir(dir)).filter((f) => f.endsWith(".json") && f !== "_index.json")
  for (const file of names) {
    const item = JSON.parse(await readFile(path.join(dir, file), "utf8"))
    for (const dep of item.dependencies ?? []) {
      const base = dep.replace(/@[\^~]?[\d.]+$/, "")
      npm.set(base, (npm.get(base) ?? 0) + 1)
    }
    filesPerItem.push((item.files ?? []).length)
    for (const f of item.files ?? []) {
      const content = f.content ?? ""
      for (const m of content.matchAll(/from\s+["'](@\/[^"']+)["']/g)) {
        const key = m[1].split("/").slice(0, 3).join("/")
        alias.set(key, (alias.get(key) ?? 0) + 1)
      }
      for (const m of content.matchAll(/from\s+["']([a-z@][^"'./][^"']*)["']/g)) {
        const pkg = m[1].startsWith("@") ? m[1].split("/").slice(0, 2).join("/") : m[1].split("/")[0]
        npm.set(pkg, (npm.get(pkg) ?? 0) + 1)
      }
    }
  }
}

const sortDesc = (m) => [...m.entries()].sort((a, b) => b[1] - a[1])
console.log("── npm imports ──")
for (const [k, v] of sortDesc(npm)) console.log(String(v).padStart(4), k)
console.log("\n── @/ alias prefixes ──")
for (const [k, v] of sortDesc(alias)) console.log(String(v).padStart(4), k)
console.log("\nfiles per item: max", Math.max(...filesPerItem), "avg", (filesPerItem.reduce((a, b) => a + b, 0) / filesPerItem.length).toFixed(1))
