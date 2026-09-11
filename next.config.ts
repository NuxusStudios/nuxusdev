import type { NextConfig } from "next"

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

export default nextConfig
