/**
 * Writes (does not delete) a manifest of every generated registry file that
 * isn't one of the hand-authored components. The importer then treats it as the
 * previous run's output and cleans it up on the next pass.
 */
import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = process.cwd()
const src = await readFile(path.join(ROOT, "src/lib/data/components.ts"), "utf8")
const authoredBlock = src.split("const AUTHORED")[1].split("export const COMPONENTS")[0]
const authored = new Set([...authoredBlock.matchAll(/previewKey: "([^"]+)"/g)].map((m) => m[1]))

const files = []
for (const dir of ["src/registry/components", "src/registry/demos"]) {
  for (const name of await readdir(path.join(ROOT, dir))) {
    const key = name.replace(/\.tsx?$/, "")
    if (!authored.has(key)) files.push(`${dir}/${name}`)
  }
}

await writeFile(
  path.join(ROOT, ".import-cache/manifest.json"),
  JSON.stringify({ files, keys: files.map((f) => path.basename(f).replace(/\.tsx?$/, "")) }, null, 2)
)
console.log(`authored kept: ${authored.size} · queued for cleanup: ${files.length}`)
