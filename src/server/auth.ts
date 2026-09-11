import "server-only"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { magicLink } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { db, schema } from "@/server/db"
import { env, providers } from "@/server/env"
import { sendMagicLink, sendPasswordReset, sendVerification } from "@/server/email"
import { hashPassword, verifyPassword } from "@/server/password"
import { assignHandle, onUserCreated } from "@/server/user-provisioning"

export const auth = betterAuth({
  appName: "Nuxus",
  secret: env.authSecret,
  baseURL: env.siteUrl,

  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    // NIST-aligned: length over composition rules
    minPasswordLength: 12,
    maxPasswordLength: 200,
    // don't let people in until they prove the address, when email is configured
    requireEmailVerification: providers.email,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordReset({ to: user.email, url })
    },
    password: {
      // delegates to Better Auth's scrypt, but refuses weak passwords first —
      // this runs on sign-up and on every password change
      hash: hashPassword,
      verify: verifyPassword,
    },
  },

  emailVerification: {
    sendOnSignUp: providers.email,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerification({ to: user.email, url })
    },
  },

  socialProviders: {
    ...(providers.github
      ? {
          github: {
            clientId: env.GITHUB_CLIENT_ID!,
            clientSecret: env.GITHUB_CLIENT_SECRET!,
          },
        }
      : {}),
    ...(providers.google
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
          },
        }
      : {}),
  },

  account: {
    accountLinking: {
      // only link a social account to an existing user when the provider has
      // actually verified the address — otherwise this is an account-takeover
      enabled: true,
      trustedProviders: ["github", "google"],
    },
  },

  user: {
    additionalFields: {
      handle: { type: "string", required: false, input: false },
      bio: { type: "string", required: false },
      website: { type: "string", required: false },
      location: { type: "string", required: false },
      githubUsername: { type: "string", required: false, input: false },
      twitterUsername: { type: "string", required: false },
      role: { type: "string", required: false, input: false },
      banned: { type: "boolean", required: false, input: false },
    },
    deleteUser: { enabled: true },
    changeEmail: { enabled: true },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // refresh the expiry at most once a day
    freshAge: 60 * 15, // re-auth required for sensitive actions after 15 min
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  // Better Auth's own limiter, in front of every auth endpoint
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    customRules: {
      "/sign-in/email": { window: 300, max: 8 },
      "/sign-up/email": { window: 3600, max: 5 },
      "/forget-password": { window: 3600, max: 5 },
      "/sign-in/magic-link": { window: 900, max: 6 },
      "/reset-password": { window: 3600, max: 8 },
    },
  },

  advanced: {
    /**
     * Where to read the caller's address from.
     *
     * The app is reached only through the host's proxy, which is what makes
     * these headers trustworthy — a request that could reach the origin
     * directly could forge any of them. Without this, Better Auth can't tell
     * callers apart and drops back to one shared bucket per path, so a single
     * attacker hammering /sign-in locks out everybody else.
     *
     * Tried in order; the first one present wins.
     */
    ipAddress: {
      ipAddressHeaders: [
        "cf-connecting-ip",
        "true-client-ip",
        "x-real-ip",
        "x-forwarded-for",
      ],
    },

    useSecureCookies: env.isProduction,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: env.isProduction,
      path: "/",
    },
  },

  trustedOrigins: [env.siteUrl],

  databaseHooks: {
    user: {
      create: {
        // the handle goes in before the row is written so it's in the first session
        before: async (data) => ({
          data: {
            ...data,
            handle: await assignHandle(data.email as string, data.name as string | undefined),
          },
        }),
        after: async (created) => {
          await onUserCreated(created.id)
        },
      },
    },
  },

  plugins: [
    magicLink({
      expiresIn: 60 * 10,
      disableSignUp: false,
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLink({ to: email, url })
      },
    }),
    // must stay last: lets server actions set cookies
    nextCookies(),
  ],
})

export type Session = typeof auth.$Infer.Session
