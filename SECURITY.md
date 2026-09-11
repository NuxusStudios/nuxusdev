# Security model

What's implemented, and what deliberately isn't. Read the last section before
you deploy.

## Authentication

Handled by [Better Auth](https://better-auth.com) — session management, token
generation and password hashing are its code, not ours. We configure it and
harden around it.

| Control | Where |
| --- | --- |
| Database | MySQL over localhost — never exposed to the internet |
| Password hashing | scrypt (Better Auth), salt + hash, never reversible |
| Password policy | `src/lib/password-policy.ts`, enforced in `src/server/password.ts` |
| Session cookies | `HttpOnly`, `SameSite=Lax`, `Secure` in production, `__Secure-` prefix |
| Session lifetime | 30 days, refreshed at most daily; 15-minute freshness window for sensitive actions |
| CSRF | Origin validation on every auth endpoint (`trustedOrigins`); server actions get Next's own origin check |
| Rate limiting | Better Auth limiter on `/api/auth/*`, plus `src/server/rate-limit.ts` on application mutations |
| Account linking | Only for providers that verify email (GitHub, Google) — prevents takeover via unverified addresses |
| Email enumeration | Password reset always reports success; sign-in failures are generic |

**Password policy** is NIST-style: 12 characters minimum, no composition rules,
and a blocklist covering common breach-list entries, keyboard runs, repeated
units and passwords containing the user's own name or address. It runs inside
the hash function, so it is enforced on sign-up *and* on every password change —
not just at the form.

Verified rate limits: 8 sign-in attempts per 5 minutes, 5 sign-ups per hour,
5 password resets per hour, 6 magic links per 15 minutes.

## Authorisation

Every mutation is a server action that:

1. calls `requireUser()` — reads the session **from the database**, not the cookie
2. validates input with zod before touching anything
3. scopes the query by `userId`, so ownership is enforced by the WHERE clause
   rather than by a separate check that could be forgotten

`src/middleware.ts` also redirects unauthenticated users away from `/bookmarks`,
`/publish` and `/settings`, but that check only looks for a cookie's *presence*.
It is a UX shortcut and is never the thing that protects data.

Errors are normalised by `src/server/actions/result.ts` — expected failures
return their message, everything else is logged server-side and reported to the
browser as a generic string. Internal errors never reach the client.

## Headers

Set per-request in `src/middleware.ts`:

- **CSP** with a per-request nonce for scripts and `strict-dynamic`.
  `style-src` keeps `'unsafe-inline'` because registry components ship inline
  `<style>` blocks — script execution is the boundary that matters here.
- `frame-ancestors 'self'` / `X-Frame-Options: SAMEORIGIN` — component previews
  are same-origin iframes, so the site can frame itself but nobody else can.
- `Strict-Transport-Security` (production), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  denying camera/microphone/geolocation, `Cross-Origin-Opener-Policy: same-origin`.

## The paywall

Copying source, prompts and CLI commands requires an active plan. Previews,
browsing and search stay free for everyone.

This is enforced **server-side, by omission**. `src/app/[handle]/components/[slug]/page.tsx`
asks `getEntitlements()` first and, without a plan, highlights only the opening
~30% of each file (6–16 lines). The rest of the source is never serialised into
the page — there is nothing to recover from the network tab, the RSC payload or
devtools, and re-enabling a disabled button achieves nothing.

The text itself is fetched on click through `getCopyPayload()` in
`src/server/actions/source.ts`, which calls `requireCopyAccess()` before it
reads anything. `readEntitlements()` exists only so the UI knows whether to draw
a lock icon; tampering with its response changes no outcome.

Verified: with no plan, the strings `shimmer-slide`, `spin-around` and
`conic-gradient` appear zero times in the component page. With a Builder plan,
all three are present.

Entitlement is resolved from the `subscription` table, and a row whose
`current_period_end` has passed grants nothing regardless of its `status` — a
provider webhook that never arrives fails closed.

**Client-generated artefacts are a softer gate.** Gradients, ASCII art, icon
snippets and theme CSS are produced in the browser from data that is already on
the page, so their copy buttons check the plan but the underlying values are
inherently visible. That's a product gate, not a security boundary, and it is
the honest limit of what a client-rendered studio can enforce.

## User-submitted code

Publishing stores React source written by other people. **It is never executed** —
not on the server, not in the browser. It is stored as text and rendered only
through Shiki, which escapes it.

This is why user-published components have no live preview. Running untrusted
code safely needs a bundler inside a sandboxed *separate origin*; doing it on
this origin would hand any publisher a stored-XSS primitive against every
visitor. The empty preview frame is the honest state of that feature, not an
oversight.

## Known gaps

Be aware of these before going live:

1. **Rate limiting is per-process.** `src/server/rate-limit.ts` holds counters in
   memory. On a single Node process — which is how this deploys to Hostinger —
   that is correct and complete. It only becomes a gap if you scale to multiple
   instances, at which point back it with Redis; the interface is one file.
2. **No audit log.** Sign-ins, password changes and publishes aren't recorded
   anywhere queryable.
3. **No 2FA.** Better Auth ships a `twoFactor` plugin; it isn't enabled.
4. **No bot defence on sign-up.** Rate limiting slows automation but there's no
   CAPTCHA or proof-of-work.
5. **`drizzle-kit` pulls a flagged esbuild** (GHSA-67mh-4wv8-2f99, moderate). It's
   a dev-only CLI dependency, never in the deployed bundle, and the latest
   version still bundles it. `npm audit --omit=dev` reports it because
   `better-auth` lists drizzle-kit as a dependency for its own CLI.
6. **Email is required for verification to mean anything.** Without
   `RESEND_API_KEY`, `requireEmailVerification` is off and accounts are usable
   immediately. Set it before launch.
7. **The dev-only plan grant route.** `POST /api/dev/grant-plan` returns 404 when
   `NODE_ENV=production`. Confirm that on the deployed server before launch —
   `npm run auth:check` will tell you if `NODE_ENV` isn't set correctly.
