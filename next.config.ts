import type { NextConfig } from "next"
// Sentry 11 moved the build wrapper to its own entry point.
import { withSentryConfig } from "@sentry/nextjs/config"

const nextConfig: NextConfig = {
  // the registry previews are rendered inside iframes — the dev overlay would
  // show up in every card, so keep it off
  devIndicators: false,
  images: {
    // imported demos reference images on arbitrary CDNs (avatars, mockups,
    // unsplash); previews are a sandbox, so allow any https host
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // PGlite ships WASM plus Node fs interop that breaks when bundled; postgres.js
  // is a plain Node client with no reason to go through the bundler either
  // Both of these are read from disk at runtime, so they must survive into the
  // deployment: the migrator reads drizzle/, and the code viewer reads the
  // registry sources to show a component's real source.
  outputFileTracingIncludes: {
    "/**": ["./drizzle/**/*", "./src/registry/components/**/*", "./src/registry/demos/**/*"],
  },
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
}

/**
 * Sentry's build step is applied only when a DSN is configured.
 *
 * Wrapping unconditionally works, but it rewrites the build and prints upload
 * warnings on every deploy of a project that has no Sentry account behind it.
 * Off by default means this ships inert and turns itself on when the DSN
 * appears in the environment.
 *
 * Source maps are uploaded only with an auth token. Without one the build still
 * succeeds and stack traces arrive minified — readable enough to act on, and
 * the token can be added later.
 */
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      // The tunnel would route events through this origin to dodge ad
      // blockers. It is off because it turns the app into an open relay to
      // Sentry unless the route is rate limited, which is not worth it for the
      // handful of reports an ad blocker drops.
      widenClientFileUpload: false,
    })
  : nextConfig
