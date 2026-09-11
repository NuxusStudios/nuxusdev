import "server-only"
import { eq } from "drizzle-orm"
import { db, schema } from "@/server/db"
import { parseThemeCss, renderThemeCss, THEME_VARS } from "@/lib/theme-css"
import { THEME_MAP } from "@/lib/data/themes"

/**
 * A user's saved design tokens.
 *
 * Every preview on the site can render in these instead of the site default,
 * which is the point: you see a component in your own brand before you decide
 * whether to use it.
 */

export interface StoredTheme {
  light: Record<string, string>
  dark: Record<string, string>
}

export interface BrandThemeView extends StoredTheme {
  name: string
  /** how many of the known tokens they actually supplied */
  coverage: number
  updatedAt: Date
}

export async function getBrandTheme(userId: string): Promise<BrandThemeView | null> {
  const [row] = await db
    .select()
    .from(schema.brandTheme)
    .where(eq(schema.brandTheme.userId, userId))
    .limit(1)

  if (!row) return null

  const parsed = safeParse(row.vars)
  if (!parsed) return null

  return {
    ...parsed,
    name: row.name,
    coverage: Object.keys(parsed.light).length,
    updatedAt: row.updatedAt,
  }
}

/** Parses a pasted stylesheet and replaces whatever the user had before. */
export async function saveBrandTheme(
  userId: string,
  name: string,
  css: string
): Promise<{ light: number; dark: number; ignored: string[] }> {
  const parsed = parseThemeCss(css)

  const vars = JSON.stringify({ light: parsed.light, dark: parsed.dark })
  const [existing] = await db
    .select({ id: schema.brandTheme.id })
    .from(schema.brandTheme)
    .where(eq(schema.brandTheme.userId, userId))
    .limit(1)

  if (existing) {
    await db
      .update(schema.brandTheme)
      .set({ name, vars, updatedAt: new Date() })
      .where(eq(schema.brandTheme.id, existing.id))
  } else {
    await db.insert(schema.brandTheme).values({ id: crypto.randomUUID(), userId, name, vars })
  }

  return {
    light: Object.keys(parsed.light).length,
    dark: Object.keys(parsed.dark).length,
    ignored: parsed.ignored,
  }
}

export async function deleteBrandTheme(userId: string): Promise<void> {
  await db.delete(schema.brandTheme).where(eq(schema.brandTheme.userId, userId))
}

/**
 * The CSS to inject into a preview, for a theme identified by `slug`.
 *
 * "mine" resolves to the signed-in user's saved tokens; any other value must
 * match a catalogue theme. Nothing here ever renders CSS supplied in the URL.
 */
export async function previewThemeCss(
  slug: string | null | undefined,
  userId: string | null
): Promise<string> {
  if (!slug) return ""

  if (slug === "mine") {
    if (!userId) return ""
    const theme = await getBrandTheme(userId)
    return theme ? renderThemeCss(theme) : ""
  }

  const catalogue = THEME_MAP.get(slug)
  if (!catalogue) return ""

  // catalogue themes only define a handful of vars, and they're ours
  return renderThemeCss({ light: catalogue.cssVars, dark: {} })
}

export const TOKEN_COUNT = THEME_VARS.length

function safeParse(raw: string): StoredTheme | null {
  try {
    const value = JSON.parse(raw) as StoredTheme
    if (!value || typeof value !== "object") return null
    return { light: value.light ?? {}, dark: value.dark ?? {} }
  } catch {
    return null
  }
}
