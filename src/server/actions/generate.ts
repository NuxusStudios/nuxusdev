"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import { requireCopyAccess } from "@/server/entitlements"
import { getBalance, refund, spend, OutOfCreditsError } from "@/server/credits"
import { aiAvailable, AiFailedError, AiUnavailableError, ask, extractJson } from "@/server/ai"
import { saveBrandTheme } from "@/server/brand-theme"
import { isSafeValue, THEME_VARS } from "@/lib/theme-css"

/** One generation, one credit. */
const THEME_COST = 1

const briefSchema = z
  .string()
  .trim()
  .min(8, "Describe the look you're after in a few more words")
  .max(400, "Keep the brief under 400 characters")

const SYSTEM = `You generate design token palettes for shadcn/ui projects.

Reply with a single JSON object and nothing else, shaped exactly like:
{"name":"...","light":{"--background":"...","--foreground":"..."},"dark":{...}}

Rules:
- Use only these token names: ${THEME_VARS.join(", ")}
- Every colour must be an oklch() value, e.g. oklch(0.62 0.16 245)
- --radius must be a rem length, e.g. 0.625rem
- Provide the full set in "light" and the full set in "dark"
- Foreground and background pairs must reach at least 4.5:1 contrast
- "name" is two or three words, no quotes
- No commentary, no markdown fence`

interface GeneratedTheme {
  name?: string
  light?: Record<string, string>
  dark?: Record<string, string>
}

/** Drops anything that isn't a token we render or a value we'd inject. */
function clean(vars: Record<string, string> | undefined): Record<string, string> {
  const allowed = new Set<string>(THEME_VARS)
  const out: Record<string, string> = {}

  for (const [name, value] of Object.entries(vars ?? {})) {
    if (!allowed.has(name)) continue
    if (typeof value !== "string") continue
    if (!isSafeValue(value)) continue
    out[name] = value.trim()
  }

  return out
}

function toCss(name: string, light: Record<string, string>, dark: Record<string, string>): string {
  const block = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join("\n")

  return `/* ${name} */\n:root {\n${block(light)}\n}\n\n.dark {\n${block(dark)}\n}\n`
}

export async function generateTheme(brief: string) {
  return run(async () => {
    const user = await requireUser()

    // generation is a paid feature like everything else that costs us money
    const entitlements = await requireCopyAccess()
    enforceRateLimit(`generate:theme:${user.id}`, { max: 20, windowSeconds: 3600 })

    if (!aiAvailable) throw new ValidationError("Theme generation isn't switched on yet.")

    const parsed = briefSchema.safeParse(brief)
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0].message)

    // charged before the call, refunded if it fails — otherwise a failing
    // request can be retried for free in a loop
    let charge: string | null = null
    try {
      charge = await spend(user.id, THEME_COST, "theme", {
        allowance: entitlements.aiCredits,
        note: parsed.data.slice(0, 120),
      })
    } catch (error) {
      if (error instanceof OutOfCreditsError) {
        throw new ValidationError(
          `You're out of AI credits this month. ${error.balance} remaining.`
        )
      }
      throw error
    }

    try {
      const reply = await ask({
        system: SYSTEM,
        prompt: `Design a theme for: ${parsed.data}`,
        maxTokens: 1400,
      })

      const generated = extractJson<GeneratedTheme>(reply)
      const light = clean(generated.light)
      const dark = clean(generated.dark)

      // a palette missing its background or foreground isn't a theme
      if (!light["--background"] || !light["--foreground"]) throw new AiFailedError()

      const name = (generated.name ?? "Generated theme").toString().trim().slice(0, 60)
      const css = toCss(name, light, dark)

      await saveBrandTheme(user.id, name, css)
      revalidatePath("/", "layout")

      const balance = await getBalance(user.id, entitlements.aiCredits)

      return {
        name,
        css,
        tokens: Object.keys(light).length,
        darkTokens: Object.keys(dark).length,
        remaining: balance.remaining,
      }
    } catch (error) {
      if (charge) await refund(user.id, THEME_COST, "theme")

      if (error instanceof AiUnavailableError) {
        throw new ValidationError("Theme generation isn't switched on yet.")
      }
      if (error instanceof AiFailedError) throw new ValidationError(error.message)
      throw error
    }
  })
}

export async function readBalance() {
  return run(async () => {
    const user = await requireUser()
    const balance = await getBalance(user.id)
    return {
      allowance: balance.allowance,
      used: balance.used,
      remaining: balance.remaining,
      renewsAt: balance.renewsAt.toISOString(),
      available: aiAvailable,
    }
  })
}
