"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import { deleteBrandTheme, saveBrandTheme } from "@/server/brand-theme"

const schema = z.object({
  name: z.string().trim().max(80).optional(),
  css: z.string().trim().min(1, "Paste your theme CSS first").max(200_000),
})

export async function saveTheme(name: string, css: string) {
  return run(async () => {
    const user = await requireUser()
    enforceRateLimit(`theme:save:${user.id}`, { max: 60, windowSeconds: 3600 })

    const parsed = schema.safeParse({ name, css })
    if (!parsed.success) throw new ValidationError(parsed.error.issues[0].message)

    const result = await saveBrandTheme(user.id, parsed.data.name || "My theme", parsed.data.css)

    if (result.light === 0 && result.dark === 0) {
      throw new ValidationError(
        "No usable tokens in that. Paste the :root block from your globals.css, including the --background and --primary lines."
      )
    }

    revalidatePath("/", "layout")
    return result
  })
}

export async function clearTheme() {
  return run(async () => {
    const user = await requireUser()
    await deleteBrandTheme(user.id)
    revalidatePath("/", "layout")
  })
}
