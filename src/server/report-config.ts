import "server-only"
import { providers, env } from "@/server/env"

/**
 * Prints what is and isn't configured, once, at boot.
 *
 * Hostinger injects environment variables into the app process only, so a
 * script run over SSH sees none of them and reports everything as missing.
 * The running server is the only place that can answer this honestly, which
 * makes the deploy log the right place to say it.
 *
 * Never prints a secret value — only whether one is present.
 */
export function reportConfig(): void {
  const lines = [
    `database        ${env.DATABASE_URL ? "configured" : "MISSING"}`,
    `auth secret     ${env.BETTER_AUTH_SECRET ? "configured" : "MISSING"}`,
    `auth url        ${env.BETTER_AUTH_URL ?? "MISSING"}`,
    `email           ${providers.email ? `configured — from ${env.EMAIL_FROM}` : "off — anyone can register any address"}`,
    `billing         ${providers.billing ? "configured" : "off — checkout disabled"}`,
    `ai              ${providers.ai ? "configured" : "off — generators unavailable, credits unspendable"}`,
    `github oauth    ${providers.github ? "configured" : "off"}`,
    `google oauth    ${providers.google ? "configured" : "off"}`,
  ]

  console.info(`[startup] configuration\n${lines.map((line) => `  ${line}`).join("\n")}`)

  if (!providers.ai) {
    console.warn(
      "[startup] AI generation is OFF. Plans that include AI credits currently " +
        "have nothing to spend them on. Set ANTHROPIC_API_KEY."
    )
  }

  if (!providers.email) {
    console.warn(
      "[startup] email verification is DISABLED. Set RESEND_API_KEY and EMAIL_FROM " +
        "to require a working address at sign-up."
    )
  }
}
