import "server-only"
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from "@iconify/utils"
import type { IconifyJSON } from "@iconify/types"
import indexData from "@/lib/generated/icon-index.json"

/**
 * Icon search over ~42,000 icons from eight open-source sets.
 *
 * Only the name index (~0.9MB) is held in memory. The full icon data is ~40MB,
 * so each set's JSON is loaded lazily the first time an icon from it is
 * rendered and then cached — a shared host can't afford all of it up front.
 */

export interface IconSet {
  id: string
  name: string
  license: string
  url: string
  count: number
}

export const ICON_SETS = indexData.sets as IconSet[]
const ICON_IDS = indexData.icons as string[]

export const TOTAL_ICONS = ICON_IDS.length

const SET_MAP = new Map(ICON_SETS.map((set) => [set.id, set]))

const loaded = new Map<string, IconifyJSON>()

async function loadSet(setId: string): Promise<IconifyJSON | null> {
  if (loaded.has(setId)) return loaded.get(setId)!
  if (!SET_MAP.has(setId)) return null

  try {
    // the import specifier has to be statically analysable enough to resolve,
    // but each set is only pulled in when something asks for it
    const data = (await import(`@iconify-json/${setId}/icons.json`)) as { default: IconifyJSON }
    loaded.set(setId, data.default)
    return data.default
  } catch {
    return null
  }
}

export interface IconHit {
  id: string
  set: string
  setName: string
  name: string
}

function describe(id: string): IconHit {
  const [setId, ...rest] = id.split(":")
  const name = rest.join(":")
  return {
    id,
    set: setId,
    setName: SET_MAP.get(setId)?.name ?? setId,
    name,
  }
}

/**
 * Ranks by how well the query matches: whole-name first, then word-start, then
 * anywhere. Without this, searching "home" buries `home` under `home-2`,
 * `home-bolt` and four hundred others.
 */
export function searchIcons(
  query: string,
  { set, limit = 120, offset = 0 }: { set?: string; limit?: number; offset?: number } = {}
): { hits: IconHit[]; total: number } {
  const needle = query.trim().toLowerCase().replace(/\s+/g, "-")

  let pool = ICON_IDS
  if (set && SET_MAP.has(set)) {
    pool = pool.filter((id) => id.startsWith(`${set}:`))
  }

  if (!needle) {
    return {
      hits: pool.slice(offset, offset + limit).map(describe),
      total: pool.length,
    }
  }

  const exact: string[] = []
  const prefix: string[] = []
  const word: string[] = []
  const loose: string[] = []

  for (const id of pool) {
    const name = id.slice(id.indexOf(":") + 1)
    if (name === needle) exact.push(id)
    else if (name.startsWith(needle)) prefix.push(id)
    else if (name.includes(`-${needle}`)) word.push(id)
    else if (name.includes(needle)) loose.push(id)
  }

  const ranked = [...exact, ...prefix, ...word, ...loose]
  return {
    hits: ranked.slice(offset, offset + limit).map(describe),
    total: ranked.length,
  }
}

/** Renders one icon to an SVG string, sized for inline use. */
export async function renderIcon(id: string, size = 24): Promise<string | null> {
  const [setId, ...rest] = id.split(":")
  const name = rest.join(":")
  if (!setId || !name) return null

  const data = await loadSet(setId)
  if (!data) return null

  const iconData = getIconData(data, name)
  if (!iconData) return null

  const rendered = iconToSVG(iconData, { height: `${size}`, width: `${size}` })

  return iconToHTML(replaceIDs(rendered.body), {
    ...rendered.attributes,
    fill: "currentColor",
  })
}
