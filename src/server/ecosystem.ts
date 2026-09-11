import "server-only"
import { readFileSync } from "node:fs"
import { join } from "node:path"

/**
 * Search across every public shadcn registry, not just ours.
 *
 * We index metadata only — name, description, categories — and always install
 * from the origin registry, so authors keep their traffic and their licence.
 * Being the map rather than the territory is the point: a catalogue of 160
 * can't compete with 37,000, but a good index over all of them is worth more
 * than either.
 */

type ItemTuple = [name: string, title: string, description: string, type: string, categories: string]

interface RawRegistry {
  ns: string
  home: string | null
  install: string
  status: string
  items: ItemTuple[]
}

export interface EcosystemItem {
  /** e.g. "@magicui" */
  namespace: string
  name: string
  title: string
  description: string
  type: string
  categories: string[]
  homepage: string | null
  /** the exact command that installs it */
  install: string
  status: string
}

const RELATIVE = "src/lib/data/registry-items.json"

let cache: RawRegistry[] | null = null

/**
 * Parsed once, on the first search.
 *
 * 5MB of JSON is not something to pay for on a request that never searches, so
 * this is deliberately lazy rather than a module-level import.
 */
function load(): RawRegistry[] {
  if (cache) return cache

  // Hostinger runs the server from a versioned directory rather than the
  // project root, so the path is searched the same way migrations are
  const candidates = [
    join(process.cwd(), RELATIVE),
    join(process.cwd(), "..", RELATIVE),
    join(process.cwd(), "..", "..", RELATIVE),
  ]

  for (const candidate of candidates) {
    try {
      const payload = JSON.parse(readFileSync(candidate, "utf8")) as { registries: RawRegistry[] }
      cache = payload.registries ?? []
      return cache
    } catch {
      continue
    }
  }

  // an empty index degrades ecosystem search to "no results" rather than
  // taking down every page that happens to import this module
  console.error(`[ecosystem] index not found. cwd=${process.cwd()} tried=[${candidates.join(", ")}]`)
  cache = []
  return cache
}

export function ecosystemStats(): { registries: number; items: number } {
  const registries = load()
  return {
    registries: registries.length,
    items: registries.reduce((sum, registry) => sum + registry.items.length, 0),
  }
}

/** Higher is better; 0 means no match. */
function score(needle: string, name: string, title: string, description: string, categories: string): number {
  if (name === needle) return 100
  if (name.startsWith(needle)) return 80
  if (name.includes(needle)) return 60

  const haystack = `${title} ${categories}`.toLowerCase()
  if (haystack.includes(needle)) return 45

  // a word-start match in the description beats a match mid-word
  const index = description.toLowerCase().indexOf(needle)
  if (index === 0) return 30
  if (index > 0) return description[index - 1] === " " ? 25 : 12

  return 0
}

export interface EcosystemQuery {
  q: string
  limit?: number
  /** only registries the upstream index reports as healthy */
  healthyOnly?: boolean
}

export function searchEcosystem({ q, limit = 20, healthyOnly = false }: EcosystemQuery): EcosystemItem[] {
  const needle = q.trim().toLowerCase()
  if (needle.length < 2) return []

  const matches: { item: EcosystemItem; rank: number }[] = []

  for (const registry of load()) {
    if (healthyOnly && registry.status !== "healthy") continue

    // a broken registry's components can't be installed, so rank them below
    const penalty = registry.status === "healthy" ? 0 : registry.status === "observing" ? 2 : 8

    for (const [name, title, description, type, categories] of registry.items) {
      const rank = score(needle, name.toLowerCase(), title, description, categories)
      if (rank === 0) continue

      matches.push({
        rank: rank - penalty,
        item: {
          namespace: registry.ns,
          name,
          title: title || titleise(name),
          description,
          type: type ? `registry:${type}` : "registry:ui",
          categories: categories ? categories.split(",") : [],
          homepage: registry.home,
          install: `npx shadcn@latest add ${registry.ns}/${name}`,
          status: registry.status,
        },
      })
    }
  }

  matches.sort((a, b) => b.rank - a.rank || a.item.name.length - b.item.name.length)
  return matches.slice(0, limit).map((match) => match.item)
}

function titleise(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
