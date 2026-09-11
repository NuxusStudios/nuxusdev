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
  serverExternalPackages: ["@electric-sql/pglite", "postgres"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
