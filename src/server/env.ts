import "server-only"
import { z } from "zod"

/**
 * Validated server environment. Anything missing that the app genuinely needs
 * fails at boot rather than at the first request — and in production the
 * secrets are required outright rather than falling back to a dev default.
 */
const isProduction = process.env.NODE_ENV === "production"

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  /** MySQL connection string: mysql://user:password@host:3306/database */
  DATABASE_URL: z
    .string()
    .refine(
      (value) => value.startsWith("mysql://") || value.startsWith("mysql2://"),
      "DATABASE_URL must be a mysql:// connection string"
    )
    .optional(),

  /** Signs session cookies. Must be a long random string in production. */
  BETTER_AUTH_SECRET: isProduction
    ? z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters in production")
    : z.string().min(32).optional(),

  /** Public origin, used for callbacks and cookie domain. */
  BETTER_AUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  /** Stripe. Test keys start sk_test_ / whsec_; live keys sk_live_. */
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  /** Price ids from the Stripe dashboard, one per plan and billing cycle. */
  STRIPE_PRICE_BUILDER_QUARTERLY: z.string().optional(),
  STRIPE_PRICE_BUILDER_YEARLY: z.string().optional(),
  /** Builder + AI is priced per credit tier, so one id per tier per cycle */
  STRIPE_PRICE_BUILDER_AI_QUARTERLY_500: z.string().optional(),
  STRIPE_PRICE_BUILDER_AI_QUARTERLY_1000: z.string().optional(),
  STRIPE_PRICE_BUILDER_AI_QUARTERLY_2000: z.string().optional(),
  STRIPE_PRICE_BUILDER_AI_YEARLY_500: z.string().optional(),
  STRIPE_PRICE_BUILDER_AI_YEARLY_1000: z.string().optional(),
  STRIPE_PRICE_BUILDER_AI_YEARLY_2000: z.string().optional(),
  STRIPE_PRICE_TEAM_QUARTERLY: z.string().optional(),
  STRIPE_PRICE_TEAM_YEARLY: z.string().optional(),
  STRIPE_PRICE_TEAM_AI_QUARTERLY_500: z.string().optional(),
  STRIPE_PRICE_TEAM_AI_QUARTERLY_1000: z.string().optional(),
  STRIPE_PRICE_TEAM_AI_QUARTERLY_2000: z.string().optional(),
  STRIPE_PRICE_TEAM_AI_YEARLY_500: z.string().optional(),
  STRIPE_PRICE_TEAM_AI_YEARLY_1000: z.string().optional(),
  STRIPE_PRICE_TEAM_AI_YEARLY_2000: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  // This runs during `next build` too, so the message has to be readable in a
  // deployment log where there is no other context.
  const issues = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")} — ${issue.message}`)
    .join("\n")

  throw new Error(
    [
      "",
      "══════════════════════════════════════════════════════════",
      " Missing or invalid environment variables",
      "══════════════════════════════════════════════════════════",
      issues,
      "",
      " Set these where the app runs (hosting panel → environment):",
      "",
      "   DATABASE_URL         mysql://user:password@localhost:3306/db",
      "   BETTER_AUTH_SECRET   openssl rand -base64 48",
      "   BETTER_AUTH_URL      https://your-domain.com",
      "   NEXT_PUBLIC_SITE_URL https://your-domain.com",
      "",
      " Locally, copy .env.example to .env.local.",
      "══════════════════════════════════════════════════════════",
      "",
    ].join("\n")
  )
}

const raw = parsed.data

export const env = {
  ...raw,
  isProduction,

  /**
   * Development-only fallback so the app runs before any secret is set.
   * The schema above makes this unreachable in production.
   */
  authSecret:
    raw.BETTER_AUTH_SECRET ??
    "dev-only-insecure-secret-change-me-before-deploying-anywhere",

  siteUrl:
    raw.BETTER_AUTH_URL ??
    raw.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000",
} as const

export const providers = {
  github: Boolean(raw.GITHUB_CLIENT_ID && raw.GITHUB_CLIENT_SECRET),
  google: Boolean(raw.GOOGLE_CLIENT_ID && raw.GOOGLE_CLIENT_SECRET),
  email: Boolean(raw.RESEND_API_KEY && raw.EMAIL_FROM),
  /** checkout can only run when both the key and the webhook secret exist */
  billing: Boolean(raw.STRIPE_SECRET_KEY && raw.STRIPE_WEBHOOK_SECRET),
} as const
