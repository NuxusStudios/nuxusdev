import { ImageResponse } from "next/og"
import { BRAND } from "@/lib/brand"
import { COMPONENTS } from "@/lib/data/components"
import { LIBRARIES } from "@/lib/data/libraries"
import { AUTHORS } from "@/lib/data/authors"

/**
 * The card every share of the site renders as — X, LinkedIn, Slack, Discord,
 * iMessage.
 *
 * Generated rather than a checked-in PNG so the counts are the real ones. A
 * static image would be out of date the next time a component lands, and
 * nobody remembers to re-export it.
 *
 * Written in inline styles on purpose: this renders through Satori, not a
 * browser. There is no Tailwind here, no CSS variables to resolve, and no
 * grid — every element with more than one child needs an explicit
 * `display: flex`. The colours are the dark theme's tokens converted to hex,
 * because `oklch()` and `var()` are not among the subset Satori understands.
 */

export const alt = `${BRAND.name} — ${BRAND.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BACKGROUND = "#0c0c0e"
const FOREGROUND = "#f7f7f8"
const MUTED = "#8b8b93"
const BORDER = "rgba(255,255,255,0.10)"

export default function Image() {
  const stats: [string, string][] = [
    [String(COMPONENTS.length), "live components"],
    [String(LIBRARIES.length), "libraries"],
    [String(AUTHORS.length), "authors"],
    ["MIT", "licensed throughout"],
  ]

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // A linear wash rather than radial glows: Satori draws `closest-side`
          // radials as hard-edged rectangles, and has no blur filter to soften
          // them with. This is the shape of effect it renders faithfully.
          backgroundImage:
            "linear-gradient(115deg, #0c0c0e 0%, #141a33 38%, #1b1633 62%, #0c0c0e 100%)",
          backgroundColor: BACKGROUND,
          padding: 72,
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 44,
              height: 44,
              borderRadius: 12,
              border: `1px solid ${BORDER}`,
              color: FOREGROUND,
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            N
          </div>
          <div
            style={{
              color: FOREGROUND,
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            {BRAND.wordmark}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: FOREGROUND,
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            {BRAND.tagline}
          </div>
          <div
            style={{
              marginTop: 24,
              color: MUTED,
              fontSize: 27,
              lineHeight: 1.45,
              maxWidth: 820,
            }}
          >
            {BRAND.description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 56,
            borderTop: `1px solid ${BORDER}`,
            paddingTop: 28,
          }}
        >
          {stats.map(([value, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: FOREGROUND, fontSize: 34, fontWeight: 600 }}>{value}</div>
              <div style={{ color: MUTED, fontSize: 19, marginTop: 4 }}>{label}</div>
            </div>
          ))}
          <div
            style={{
              marginLeft: "auto",
              color: MUTED,
              fontSize: 22,
            }}
          >
            {BRAND.domain}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
