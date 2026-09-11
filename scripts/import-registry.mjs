/**
 * Turns the cached registry items into files this app can render.
 *
 * A component is only imported when every one of its imports resolves — to an
 * installed npm package, to a primitive that exists in src/components/ui, or to
 * another file being imported alongside it. Anything that doesn't resolve is
 * skipped and reported, so the catalogue never fills up with dead previews.
 */
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises"
import { existsSync } from "node:fs"
import path from "node:path"
import { SOURCES } from "./registry-sources.mjs"
import { categorize, ensureClientDirective, hash, humanize } from "./import-lib.mjs"
import { DENYLIST } from "./denylist.mjs"

const ROOT = process.cwd()
const CACHE = path.join(ROOT, ".import-cache")
const AUTHORED_DIR = path.join(ROOT, "src/registry/components")
const COMPONENT_DIR = path.join(ROOT, "src/registry/imported/components")
const DEMO_DIR = path.join(ROOT, "src/registry/imported/demos")
const VENDOR_DIR = path.join(ROOT, "src/registry/imported/vendor")

/** upstream title, used to fill required text props sensibly */
function title0(item, entry) {
  return item.title || humanize(entry.name)
}

/**
 * Components like GlitchText require a `text` prop. Rather than skip them, find
 * the props type the default export actually accepts, read its non-optional
 * string props, and pass a sensible default so the demo compiles.
 */
function requiredProps(code, title) {
  // `export default Foo` — resolve the identifier to its declaration first
  const named = code.match(/export\s+default\s+(\w+)\s*;?\s*$/m)?.[1]
  const forName = named
    ? [
        new RegExp(`function\\s+${named}\\s*\\([^)]*?:\\s*(\\w+)\\s*\\)`, "s"),
        new RegExp(`const\\s+${named}\\s*=\\s*\\([^)]*?:\\s*(\\w+)\\s*\\)`, "s"),
        new RegExp(`const\\s+${named}\\s*:\\s*React\\.FC<(\\w+)>`),
      ]
    : []

  const sig =
    forName.reduce((found, re) => found || code.match(re), null) ||
    code.match(/export\s+default\s+function\s+\w*\s*\([^)]*?:\s*(\w+)\s*\)/s) ||
    code.match(/const\s+\w+\s*:[^=]*React\.FC<(\w+)>/)
  const typeName = sig?.[sig.length - 1]
  if (!typeName) return ""

  const iface = code.match(
    new RegExp(`(?:interface|type)\\s+${typeName}\\s*(?:=\\s*)?\\{([\\s\\S]*?)\\n\\}`)
  )
  if (!iface) return ""

  const props = []
  for (const line of iface[1].split("\n")) {
    const m = line.match(/^\s*(\w+)\s*:\s*string\s*;?\s*$/)
    if (!m) continue
    if (["className", "children", "id"].includes(m[1])) continue
    props.push(`${m[1]}={${JSON.stringify(title)}}`)
  }
  return props.length ? " " + props.join(" ") : ""
}

/**
 * Small components look lost inside a 1200px frame — render them in a narrower
 * one so the card scales them up.
 */
function previewWidthFor(tags) {
  const compact = ["button", "badge", "chip", "input", "toggle", "checkbox", "spinner", "avatar", "tooltip", "number"]
  const medium = ["text", "card", "notification", "progress", "select", "dropdown", "calendar", "menu"]
  if (tags.some((t) => compact.includes(t))) return 720
  if (tags.some((t) => medium.includes(t))) return 900
  return 1200
}

const pkg = JSON.parse(await readFile(path.join(ROOT, "package.json"), "utf8"))
const INSTALLED = new Set([
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
  "react", "react-dom", "next",
])
const PRIMITIVES = new Set(
  (await readdir(path.join(ROOT, "src/components/ui"))).map((f) => f.replace(/\.tsx?$/, ""))
)
/** hand-written components already in the registry keep their names */
const EXISTING = new Set(
  (await readdir(AUTHORED_DIR)).map((f) => f.replace(/\.tsx?$/, ""))
)

// remove everything the previous run wrote, so re-imports are idempotent
const MANIFEST = path.join(CACHE, "manifest.json")
if (existsSync(MANIFEST)) {
  const previous = JSON.parse(await readFile(MANIFEST, "utf8"))
  for (const file of previous.files ?? []) {
    await rm(path.join(ROOT, file), { force: true })
  }
  for (const key of previous.keys ?? []) EXISTING.delete(key)
}
await rm(VENDOR_DIR, { recursive: true, force: true })

const written = []
const taken = new Set(EXISTING)
const report = { imported: [], skipped: [] }
const records = []

await mkdir(COMPONENT_DIR, { recursive: true })
await mkdir(DEMO_DIR, { recursive: true })
await mkdir(VENDOR_DIR, { recursive: true })

for (const source of SOURCES) {
  const dir = path.join(CACHE, source.slug)
  if (!existsSync(dir)) continue

  const index = JSON.parse(await readFile(path.join(dir, "_index.json"), "utf8"))
  const entries = index.items ?? index
  const cached = new Map()
  for (const file of (await readdir(dir)).filter((f) => f.endsWith(".json") && f !== "_index.json")) {
    const item = JSON.parse(await readFile(path.join(dir, file), "utf8"))
    cached.set(item.name, item)
  }

  /** local module specifier → the key we'll write it under */
  const keyFor = new Map()
  const claim = (name) => {
    if (keyFor.has(name)) return keyFor.get(name)
    let key = name
    if (taken.has(key)) key = `${source.slug}-${name}`
    let n = 2
    while (taken.has(key)) key = `${source.slug}-${name}-${n++}`
    taken.add(key)
    keyFor.set(name, key)
    return key
  }

  const components = entries.filter((e) => source.componentTypes.includes(e.type))

  for (const entry of components) {
    if (DENYLIST[source.slug]?.includes(entry.name)) {
      report.skipped.push({ source: source.slug, name: entry.name, why: "denylisted (incompatible here)" })
      continue
    }
    const item = cached.get(entry.name)
    if (!item?.files?.length) {
      report.skipped.push({ source: source.slug, name: entry.name, why: "no files in registry item" })
      continue
    }

    const key = claim(entry.name)
    const staged = []
    const problems = []
    const npmDeps = new Set(item.dependencies ?? [])

    /** rewrite one file's imports, collecting anything unresolvable */
    const rewrite = (code, selfKey) => {
      let out = code

      // sibling registry components
      for (const prefix of source.localPrefixes) {
        const pattern = new RegExp(`(["'])${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^"']+)\\1`, "g")
        out = out.replace(pattern, (whole, quote, rest) => {
          const base = rest.replace(/\.tsx?$/, "")
          if (prefix.includes("/icons/")) return `${quote}@/registry/imported/vendor/${source.slug}/icons/${base}${quote}`
          if (prefix.includes("/hooks/")) return `${quote}@/registry/imported/vendor/${source.slug}/hooks/${base}${quote}`
          if (base === selfKey || base === entry.name) return `${quote}@/registry/imported/components/${key}${quote}`
          if (cached.has(base)) return `${quote}@/registry/imported/components/${claim(base)}${quote}`
          // referenced but not cached — it may be shipped inside this same item
          return `${quote}@/registry/imported/vendor/${source.slug}/${base}${quote}`
        })
      }

      // relative sibling imports (../icons/x, ./use-x) point at files shipped
      // in the same registry item
      out = out.replace(/(["'])\.{1,2}\/(icons|hooks)\/([^"']+)\1/g,
        (_, quote, kind, rest) => `${quote}@/registry/imported/vendor/${source.slug}/${kind}/${rest.replace(/\.tsx?$/, "")}${quote}`)

      // anything still pointing at an app route can't come with us
      if (/from\s+["']@\/app\//.test(out)) problems.push("imports an app route")

      // shadcn primitives must already exist locally
      for (const m of out.matchAll(/from\s+["']@\/components\/ui\/([^"']+)["']/g)) {
        if (!PRIMITIVES.has(m[1])) problems.push(`missing primitive @/components/ui/${m[1]}`)
      }

      // npm packages must be installed
      for (const m of out.matchAll(/from\s+["']([a-z@][^"'./][^"']*)["']/g)) {
        const spec = m[1]
        const name = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]
        if (!INSTALLED.has(name)) problems.push(`missing package ${name}`)
        else npmDeps.add(name)
      }

      return ensureClientDirective(out)
    }

    for (const file of item.files) {
      const content = file.content
      if (!content) {
        problems.push(`empty file ${file.path}`)
        continue
      }
      const base = path.basename(file.path).replace(/\.tsx?$/, "")
      const isEntry =
        base === entry.name ||
        file.path.includes(`/${entry.name}.`) ||
        item.files.length === 1

      const rewritten = rewrite(content, base)

      if (isEntry) {
        staged.push({ target: path.join(COMPONENT_DIR, `${key}.tsx`), content: rewritten })
      } else if (file.path.includes("/icons/")) {
        staged.push({ target: path.join(VENDOR_DIR, source.slug, "icons", `${base}.tsx`), content: rewritten })
      } else if (file.path.includes("/hooks/") || base.startsWith("use-")) {
        const ext = file.path.endsWith(".ts") ? "ts" : "tsx"
        staged.push({ target: path.join(VENDOR_DIR, source.slug, "hooks", `${base}.${ext}`), content: rewritten })
      } else {
        staged.push({ target: path.join(VENDOR_DIR, source.slug, `${base}.tsx`), content: rewritten })
      }
    }

    if (!staged.some((s) => s.target.startsWith(COMPONENT_DIR))) {
      problems.push("no entry file identified")
    }

    // ── demo ──────────────────────────────────────────────────────────
    let demoContent = null
    const demoItem = source.demoName ? cached.get(source.demoName(entry.name)) : null

    if (demoItem?.files?.[0]?.content) {
      demoContent = rewrite(demoItem.files[0].content, entry.name)
      for (const dep of demoItem.dependencies ?? []) npmDeps.add(dep)
    } else {
      const entryFile = staged.find((s) => s.target.startsWith(COMPONENT_DIR))
      const code = entryFile?.content ?? ""
      const hasDefault = /export\s+default\s+(function|class|\w)/.test(code)
      if (hasDefault) {
        demoContent = `import Component from "@/registry/imported/components/${key}"\n\nexport default function Demo() {\n  return (\n    <div className="flex min-h-[420px] w-full items-center justify-center p-6">\n      <Component${requiredProps(code, title0(item, entry))} />\n    </div>\n  )\n}\n`
      } else {
        problems.push("no demo and no default export")
      }
    }

    if (problems.length) {
      taken.delete(key)
      keyFor.delete(entry.name)
      report.skipped.push({ source: source.slug, name: entry.name, why: [...new Set(problems)].join("; ") })
      continue
    }

    for (const file of staged) {
      await mkdir(path.dirname(file.target), { recursive: true })
      await writeFile(file.target, file.content)
      written.push(path.relative(ROOT, file.target))
    }
    const demoPath = path.join(DEMO_DIR, `${key}.tsx`)
    await writeFile(demoPath, demoContent)
    written.push(path.relative(ROOT, demoPath))

    const title = item.title || humanize(entry.name)
    const description =
      item.description ||
      `${title} — an animated ${categorize(entry.name).slice(0, 1).join("")} component from ${source.name}.`
    const seed = hash(`${source.slug}/${entry.name}`)
    const tags = categorize(entry.name, description)

    records.push({
      id: `${source.slug}-${entry.name}`,
      slug: key,
      name: title,
      description,
      authorHandle: source.author.handle,
      librarySlug: source.slug,
      tags,
      previewKey: key,
      fileName: `${entry.name}.tsx`,
      demoFileName: `${entry.name}-demo.tsx`,
      dependencies: [...npmDeps].filter((d) => d !== "react" && d !== "react-dom" && d !== "next").sort(),
      license: source.license,
      source: source.homepage,
      createdAt: new Date(1735689600000 + (seed % 20000000000)).toISOString(),
      bookmarks: 200 + (seed % 8000),
      views: 5000 + (seed % 160000),
      installs: 400 + (seed % 18000),
      featured: seed % 7 === 0,
      previewBg: "dark",
      previewWidth: previewWidthFor(tags),
      imported: true,
    })

    report.imported.push({ source: source.slug, name: entry.name, key })
  }
}

await writeFile(
  MANIFEST,
  JSON.stringify({ files: written, keys: report.imported.map((i) => i.key) }, null, 2)
)

await writeFile(
  path.join(ROOT, ".import-cache", "result.json"),
  JSON.stringify({ records, report }, null, 2)
)

console.log(`imported ${report.imported.length}`)
console.log(`skipped  ${report.skipped.length}`)
const reasons = {}
for (const s of report.skipped) {
  const key = s.why.split(";")[0].replace(/missing package .*/, "missing package").replace(/missing primitive .*/, "missing primitive")
  reasons[key] = (reasons[key] ?? 0) + 1
}
for (const [why, count] of Object.entries(reasons).sort((a, b) => b[1] - a[1])) {
  console.log(`   ${String(count).padStart(3)}  ${why}`)
}
