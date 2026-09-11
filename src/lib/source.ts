import "server-only"
import fs from "node:fs/promises"
import path from "node:path"
import { IMPORT_ALIASES } from "@/lib/data/import-aliases"

const ROOT = path.join(process.cwd(), "src", "registry")

/** Rewrites internal registry paths to the path a consumer would actually use. */
function normalize(code: string): string {
  return code
    .replaceAll("@/registry/imported/components/", "@/components/ui/")
    .replaceAll("@/registry/components/", "@/components/ui/")
    .replace(/@\/registry\/imported\/vendor\/[^/]+\/icons\//g, "@/components/icons/")
    .replace(/@\/registry\/imported\/vendor\/[^/]+\/hooks\//g, "@/hooks/")
    .replace(/@\/registry\/imported\/vendor\/[^/]+\//g, "@/components/ui/")
    .replace(/@\/components\/ui\/([a-z0-9-]+)/g, (whole, key) =>
      IMPORT_ALIASES[key] ? `@/components/ui/${IMPORT_ALIASES[key]}` : whole
    )
    .trimEnd()
}

/** authored components first, then the imported tree */
async function readFirst(relatives: string[], fallback: string): Promise<string> {
  for (const relative of relatives) {
    try {
      return normalize(await fs.readFile(path.join(ROOT, relative), "utf8"))
    } catch {
      // try the next location
    }
  }
  return fallback
}

export function readComponentSource(key: string): Promise<string> {
  return readFirst(
    [`components/${key}.tsx`, `imported/components/${key}.tsx`],
    `// Source for "${key}" is not available.`
  )
}

export function readDemoSource(key: string): Promise<string> {
  return readFirst(
    [`demos/${key}.tsx`, `imported/demos/${key}.tsx`],
    `// Demo for "${key}" is not available.`
  )
}
