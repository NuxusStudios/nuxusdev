# Nuxus

**Interfaces that already move** — a registry of live React components. Every component runs in the
browser before you take it; copy the code, run the CLI, or copy a generated prompt and let your
agent build it.

Brand, tagline and copy live in `src/lib/brand.ts`, so renaming the product is one edit.

Built with **Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript · Motion · Shiki**.

## What's in it

| Area | Route | Notes |
| --- | --- | --- |
| Landing | `/` | WebGL hero (crossing-X shader), scroll-revealed component wall, prompt/code/CLI switcher, library marquee, FAQ |
| Browse | `/community/components/{featured,newest,updated}` | Section rails per category + infinite "Explore everything" grid |
| Category | `/community/components/s/[tag]` | 78 categories, sortable (featured / popular / newest / installs) |
| Component | `/@handle/components/[slug]` | Live preview, `Usage.tsx` / `Component.tsx` tabs, prompt dialog, CLI dialog, deps, license, similar |
| Authors | `/community/authors`, `/@handle` | Ranked leaderboard + profile with libraries and published components |
| Libraries | `/community/libraries`, `/@handle/library/[slug]` | Library index and detail |
| Templates | `/templates`, `/templates/[slug]` | Four full multi-page templates composed from registry components |
| Themes | `/themes` | Six shadcn token sets with a live preview surface and copyable CSS |
| Studios | `/community/gradients`, `/community/ascii`, `/community/shaders` | Working gradient generator, canvas-based ASCII generator, shader gallery |
| Icons | `/icons` | Searchable icon set with "search by meaning" aliases; click to copy JSX |
| Pricing | `/pricing` | Billing cycle toggle, AI credit tiers, full comparison table, FAQ |
| Publish | `/publish` | Four-step publishing flow with validation and a review summary |
| Bug Bot | `/design-bug-bot` | Product page for the PR design review bot |
| Blog | `/blog`, `/blog/[slug]` | Three posts |
| Auth | `/sign-in`, `/sign-up` | Magic-link + OAuth UI |
| Misc | `/bookmarks`, `/contact`, `/privacy`, `/terms`, `sitemap.xml`, `robots.txt` | |

## How previews work

Every card renders the **real component**, not a screenshot.

- Components live in `src/registry/components/*.tsx`, demos in `src/registry/demos/*.tsx`.
- `src/app/preview/[key]/page.tsx` renders a demo full-bleed with no chrome.
- `ComponentPreview` mounts that route in a sandboxed `<iframe>` laid out at a fixed desktop width
  and scaled with a CSS transform, so every preview is consistent. It only mounts once it scrolls
  into view (`IntersectionObserver`, 400px margin).
- The code shown on a component page is read off disk from those same files
  (`src/lib/source.ts`), so the source and the preview can never drift. Internal
  `@/registry/components/…` paths are rewritten to `@/components/ui/…` at read time — the path a
  consumer would actually use.

## The prompt

`src/lib/prompt.ts` builds a tool-specific prompt (Claude Code, Cursor, Codex, v0, Lovable, Bolt,
Windsurf) from the component metadata plus the real source and demo: file paths, install command,
and adaptation rules. It's generated, never stored, so it always matches the component.

## Data

There's no database — the registry is typed data in `src/lib/data/*` (components, authors,
libraries, templates, themes, categories, posts) queried through `src/lib/queries.ts`. That module
is the only thing that touches the data shape, so swapping in Postgres or Supabase means
reimplementing one file.

## Accounts & data

Auth is [Better Auth](https://better-auth.com) on Postgres via Drizzle. Four ways
in: email + password, GitHub, Google, and magic link. See [SECURITY.md](SECURITY.md)
for the threat model and the known gaps.

```
src/server/
  env.ts                 validated environment, fails fast in production
  auth.ts                Better Auth config
  db/schema.ts           users, sessions, accounts, verifications,
                         components, collections, collection_items, bookmarks
  session.ts             getSession / requireUser  (database-backed)
  password.ts            policy enforcement, wraps Better Auth's scrypt
  rate-limit.ts          per-process limiter for application mutations
  catalogue.ts           merges the static registry with user-published rows
  actions/               server actions: bookmarks, collections, publish
```

### Database — MySQL

Built for **MySQL 8+ / MariaDB**, which is what Hostinger shared hosting
provides. The app and database run on the same host, so the connection string
uses `localhost` and MySQL is never exposed to the internet:

```
DATABASE_URL=mysql://u000000_nuxus:PASSWORD@localhost:3306/u000000_nuxus
```

```bash
cp .env.example .env.local
openssl rand -base64 48     # BETTER_AUTH_SECRET

npm run db:generate         # after changing src/server/db/schema.ts
npm run db:migrate          # apply migrations
npm run db:studio           # browse the data
npm run auth:check          # validate config + connectivity
```

**Local development** without installing MySQL:

```bash
npm run db:dev   # terminal 1 — boots a throwaway MySQL, prints DATABASE_URL
npm run dev      # terminal 2
```

That database is ephemeral — every start is fresh and migrated. `npm run db:test`
runs the schema against a real MySQL and checks constraints, JSON columns,
cascades and upserts.

OAuth and email are optional — the sign-in form only shows the providers you
have configured, and without `RESEND_API_KEY` verification links are printed to
the server console in development.

### Plans

Browsing and previewing are free. Copying source, prompts and CLI commands
requires an active plan — enforced server-side, see [SECURITY.md](SECURITY.md).

Plans live in `src/lib/plans.ts`; entitlement is resolved in
`src/server/entitlements.ts`. There is no payment provider wired up yet, so in
development you grant yourself a plan through a dev-only route:

```bash
curl -X POST localhost:3000/api/dev/grant-plan \
  -H 'content-type: application/json' -H 'origin: http://localhost:3000' \
  -d '{"plan":"builder"}' -b cookies.txt
```

That route 404s in production. When billing is added, the provider's webhook
writes the same `subscription` rows.

### The prompt

One prompt per component, and it works in any coding agent — Claude Code,
Antigravity, Cursor, Codex, Lovable, v0, Bolt, Windsurf. There is deliberately
no "choose your tool" step: the prompt describes the files to create and the
conventions to respect, which is all any of them need. It's generated from the
same source the preview renders, so it cannot drift.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Set `NEXT_PUBLIC_SITE_URL` in production — it drives `metadataBase`, the sitemap and `robots.txt`.

### Deploying to Hostinger

Node.js app, not static export. Preview and component pages render on demand
rather than at build time, which keeps `next build` to ~164 pages so it fits in
a shared-hosting build process.

Because the filesystem is persistent, the code viewer's runtime reads from
`src/registry/` work without any bundler configuration — deploy the repository,
not just `.next`.

```bash
npm run build && npm start   # production
npx tsc --noEmit             # type check
```

## The registry importer

The catalogue is **160 components**: 44 written for this project plus 116 imported from public,
MIT-licensed shadcn registries — the same endpoints `npx shadcn add` fetches.

| Source | Components | License |
| --- | --- | --- |
| [Magic UI](https://magicui.design) | 71 | MIT |
| [Kokonut UI](https://kokonutui.com) | 45 | MIT |
| Written here | 44 | MIT |

Deliberately excluded: **Origin UI** (AGPL-3.0 — copyleft would propagate to this whole project),
**Tailark** and **Aceternity** (no LICENSE file published), and anything behind a paywall.

```bash
npm run registry:fetch    # download registry items into .import-cache/
npm run registry:import   # write component files + regenerate data
npm run registry:check    # request every preview route, report non-200s
npm run registry:reset    # queue the previous import for cleanup
```

**How it works.** `scripts/import-registry.mjs` reads the cache, rewrites each file's imports to
this project's paths, and writes components into `src/registry/imported/`. A component is only
imported when *every* import resolves — to an installed package, a primitive that exists in
`src/components/ui`, or another file coming in with it. Anything unresolvable is skipped and
reported, so the grid never fills with dead previews. It's idempotent: a manifest records
everything written and the next run removes it first.

Author, license and source URL are carried through from the upstream registry, as MIT requires, and
`src/lib/data/import-aliases.ts` maps prefixed filenames back to their upstream names so the code
viewer shows the import path a consumer would actually write. Upstream code lives in its own tree
and is excluded from lint — it isn't ours to restyle.

Engagement counts on imported components (bookmarks / views / installs) are derived from a stable
hash of the component name. This is a clone; there is no real telemetry.

## Notes on the clone

The product, layout, flows and design system are reproduced from 21st.dev. Nothing was taken from
21st.dev itself: its component sources sit in a private bucket behind a paid plan, and its authors'
work belongs to them. The catalogue here is 44 components written for this project plus 116 imported
from registries that publish openly under MIT, with attribution intact. The remaining authors,
libraries, companies and marketing copy are invented rather than lifted.
