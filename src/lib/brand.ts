/**
 * Single source of truth for the product's identity. Everything user-facing
 * reads from here, so a rename is one edit rather than a find-and-replace.
 */
export const BRAND = {
  name: "Nuxus",
  wordmark: "NUXUS",
  legalName: "Nuxus, Inc.",
  domain: "nuxus.dev",
  registryHost: "nuxus.dev",

  tagline: "Interfaces that already move",
  description:
    "A registry of live React components. Every one runs in the browser before you take it — copy the code, or copy the prompt and let your agent build it.",
  shortDescription: "The registry of live React components.",

  social: {
    x: "https://x.com",
    github: "https://github.com",
  },
} as const

export const brandTitle = (page?: string) =>
  page ? `${page} | ${BRAND.name}` : `${BRAND.tagline} | ${BRAND.name}`
