"use client"

import * as React from "react"

/**
 * The last resort: an error in the root layout itself.
 *
 * This replaces the whole document, so it has to supply its own `<html>` and
 * `<body>` — and it cannot use the site header, the fonts or any token from
 * globals.css, because the layout that loads them is exactly what failed. Every
 * style here is inline for that reason, and the colours are hard-coded rather
 * than read from CSS variables that may never have been defined.
 *
 * Almost nothing reaches this. When it does, the alternative is a blank page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("[root]", error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0c0e",
          color: "#f7f7f8",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: 24,
        }}
      >
        <main style={{ maxWidth: 460, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#8b8b93", fontFamily: "ui-monospace, monospace" }}>
            Error
          </p>
          <h1 style={{ margin: "12px 0 0", fontSize: 32, fontWeight: 600, letterSpacing: -0.5 }}>
            Nuxus failed to load
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: 15, lineHeight: 1.6, color: "#8b8b93" }}>
            Something went wrong before the page could start. Reloading usually clears it.
          </p>

          {error.digest && (
            <p
              style={{
                margin: "24px 0 0",
                display: "inline-block",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 8,
                padding: "8px 12px",
                fontFamily: "ui-monospace, monospace",
                fontSize: 13,
                color: "#8b8b93",
              }}
            >
              {error.digest}
            </p>
          )}

          <div style={{ marginTop: 32 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: "none",
                borderRadius: 999,
                padding: "10px 22px",
                background: "#f7f7f8",
                color: "#0c0c0e",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
