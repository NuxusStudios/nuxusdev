import dynamic from "next/dynamic"
import { IMPORTED_REGISTRY } from "./imported"
import type { ComponentType } from "react"

/**
 * Every publishable component in the registry maps a `previewKey` to its demo.
 * Demos are loaded lazily so a grid of previews doesn't ship every bundle at once.
 */
export const REGISTRY: Record<string, ComponentType> = {
  "animated-hero": dynamic(() => import("./demos/animated-hero")),
  "aurora-background": dynamic(() => import("./demos/aurora-background")),
  "shimmer-button": dynamic(() => import("./demos/shimmer-button")),
  "gradient-button": dynamic(() => import("./demos/gradient-button")),
  "liquid-glass-button": dynamic(() => import("./demos/liquid-glass-button")),
  "number-ticker": dynamic(() => import("./demos/number-ticker")),
  "text-shimmer": dynamic(() => import("./demos/text-shimmer")),
  "bento-grid": dynamic(() => import("./demos/bento-grid")),
  "pricing-section": dynamic(() => import("./demos/pricing-section")),
  marquee: dynamic(() => import("./demos/marquee")),
  "testimonials-columns": dynamic(() => import("./demos/testimonials-columns")),
  "faq-accordion": dynamic(() => import("./demos/faq-accordion")),
  "sign-in-card": dynamic(() => import("./demos/sign-in-card")),
  "ai-chat-input": dynamic(() => import("./demos/ai-chat-input")),
  "typewriter-text": dynamic(() => import("./demos/typewriter-text")),
  "spotlight-card": dynamic(() => import("./demos/spotlight-card")),
  "dot-pattern": dynamic(() => import("./demos/dot-pattern")),
  "macos-dock": dynamic(() => import("./demos/macos-dock")),
  "kpi-card": dynamic(() => import("./demos/kpi-card")),
  "file-tree": dynamic(() => import("./demos/file-tree")),
  "animated-tabs": dynamic(() => import("./demos/animated-tabs")),
  "avatar-stack": dynamic(() => import("./demos/avatar-stack")),
  "notification-list": dynamic(() => import("./demos/notification-list")),
  timeline: dynamic(() => import("./demos/timeline")),
  "mesh-gradient": dynamic(() => import("./demos/mesh-gradient")),
  "tilt-card": dynamic(() => import("./demos/tilt-card")),
  "progress-ring": dynamic(() => import("./demos/progress-ring")),
  "footer-section": dynamic(() => import("./demos/footer-section")),
  "stats-section": dynamic(() => import("./demos/stats-section")),
  "empty-state": dynamic(() => import("./demos/empty-state")),
  "status-badge": dynamic(() => import("./demos/status-badge")),
  "data-table": dynamic(() => import("./demos/data-table")),
  "command-palette": dynamic(() => import("./demos/command-palette")),
  "plasma-shader": dynamic(() => import("./demos/plasma-shader")),
  "wave-lines": dynamic(() => import("./demos/wave-lines")),
  "grain-overlay": dynamic(() => import("./demos/grain-overlay")),
  "image-comparison": dynamic(() => import("./demos/image-comparison")),
  "feature-steps": dynamic(() => import("./demos/feature-steps")),
  "toast-stack": dynamic(() => import("./demos/toast-stack")),
  "mini-calendar": dynamic(() => import("./demos/mini-calendar")),
  "collapsible-sidebar": dynamic(() => import("./demos/collapsible-sidebar")),
  "scroll-reveal-text": dynamic(() => import("./demos/scroll-reveal-text")),
  "team-grid": dynamic(() => import("./demos/team-grid")),
  "glow-card": dynamic(() => import("./demos/glow-card")),
}

/** Full-page templates, previewed the same way components are. */
export const TEMPLATE_REGISTRY: Record<string, ComponentType> = {
  "saas-landing": dynamic(() => import("./templates/saas-landing")),
  "analytics-dashboard": dynamic(() => import("./templates/analytics-dashboard")),
  waitlist: dynamic(() => import("./templates/waitlist")),
  agency: dynamic(() => import("./templates/agency")),
  "docs-portal": dynamic(() => import("./templates/docs-portal")),
  changelog: dynamic(() => import("./templates/changelog")),
  portfolio: dynamic(() => import("./templates/portfolio")),
  "ai-product": dynamic(() => import("./templates/ai-product")),
  ecommerce: dynamic(() => import("./templates/ecommerce")),
}

export const ALL_PREVIEWS: Record<string, ComponentType> = {
  ...REGISTRY,
  ...IMPORTED_REGISTRY,
  ...TEMPLATE_REGISTRY,
}

export const REGISTRY_KEYS = Object.keys({ ...REGISTRY, ...IMPORTED_REGISTRY })
