import { NextResponse, type NextRequest } from "next/server"

/**
 * Per-request security headers.
 *
 * The CSP is nonce-based for scripts: Next injects the nonce into its own
 * bootstrap and chunk tags, and the theme script in the root layout reads it
 * back off the request header. Styles still need 'unsafe-inline' — registry
 * components ship inline <style> blocks and Tailwind emits inline style
 * attributes — so style-src is deliberately looser than script-src.
 */

const PROTECTED = ["/bookmarks", "/publish", "/settings"]

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")
  const isDev = process.env.NODE_ENV !== "production"

  const csp = [
    `default-src 'self'`,
    // 'strict-dynamic' lets nonce'd bootstrap load the rest; dev needs eval for HMR
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline' https://api.fontshare.com`,
    `font-src 'self' data: https://cdn.fontshare.com https://api.fontshare.com`,
    // imported registry demos pull avatars and mockups from arbitrary CDNs
    `img-src 'self' data: blob: https:`,
    `media-src 'self' data: blob: https:`,
    `connect-src 'self' ${isDev ? "ws: http://localhost:*" : ""}`,
    // component previews are same-origin iframes
    `frame-src 'self'`,
    `frame-ancestors 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `worker-src 'self' blob:`,
    `manifest-src 'self'`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ]
    .filter(Boolean)
    .join("; ")

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)

  // Optimistic auth gate: presence of the session cookie only. The route
  // itself re-validates against the database — never trust this alone.
  const pathname = request.nextUrl.pathname
  if (PROTECTED.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    const hasSession =
      request.cookies.has("better-auth.session_token") ||
      request.cookies.has("__Secure-better-auth.session_token")

    if (!hasSession) {
      const url = new URL("/sign-in", request.url)
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  )
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    )
  }

  return response
}

export const config = {
  matcher: [
    // everything except static assets and image optimisation
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|woff2?)$).*)",
  ],
}
