export interface ChangelogEntry {
  version: string
  date: string
  title: string
  summary: string
  changes: { kind: "added" | "improved" | "fixed"; text: string }[]
}

/**
 * Shipped work, newest first. Every line here corresponds to something that is
 * live — if a feature is still in development it belongs on the roadmap, not
 * in the changelog.
 */
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.4",
    date: "2026-09-11",
    title: "Agents can install components directly",
    summary:
      "An MCP server and a shadcn-compatible registry endpoint, so a coding agent can search the catalogue and write a component into your project without you copying anything across.",
    changes: [
      {
        kind: "added",
        text: "MCP server at /api/mcp with search_components, get_component and list_categories — connect it from Claude Code, Cursor or any MCP client.",
      },
      {
        kind: "added",
        text: "Registry endpoint at /r/<author>/<component> returning shadcn registry-item.json, so `npx shadcn@latest add` works against any published component.",
      },
      {
        kind: "added",
        text: "Personal access tokens in Settings. A terminal has no browser session, so the CLI and MCP authenticate with a token that carries your plan.",
      },
      {
        kind: "fixed",
        text: "The CLI command shown in the copy dialog pointed at a registry URL that returned 404. It now resolves.",
      },
    ],
  },
  {
    version: "1.3",
    date: "2026-09-04",
    title: "A much larger catalogue",
    summary:
      "More of everything: components across the sections people actually asked for, plus a full icon index and a wider set of themes and templates.",
    changes: [
      { kind: "added", text: "Headers, footers, toolbars, carousels, testimonials and pricing sections." },
      { kind: "added", text: "42,120 icons across eight open-source sets, searchable by name and copyable as JSX." },
      { kind: "added", text: "16 themes and 9 full-page templates." },
      { kind: "improved", text: "Search ranks exact and prefix matches above substring hits, so short queries stop returning noise." },
    ],
  },
  {
    version: "1.2",
    date: "2026-08-21",
    title: "Plans and billing",
    summary:
      "Checkout, subscriptions and the entitlement model that decides who can copy what.",
    changes: [
      { kind: "added", text: "Stripe Checkout for Builder and Team plans, quarterly or yearly, with per-seat pricing for teams." },
      { kind: "added", text: "AI credit tiers at 500, 1,000 and 2,000 credits a month." },
      { kind: "added", text: "Billing portal for changing a plan, updating a card or cancelling." },
      { kind: "improved", text: "Copying is gated server-side: source for a component you can't access is never sent to the browser in the first place." },
    ],
  },
  {
    version: "1.1",
    date: "2026-08-07",
    title: "Accounts and publishing",
    summary: "Sign in, claim a handle, and publish your own components to the registry.",
    changes: [
      { kind: "added", text: "Email and password sign-in, magic links, and GitHub and Google as providers." },
      { kind: "added", text: "Public profiles at /@handle with the components you've published." },
      { kind: "added", text: "Bookmarks and collections for organising what you find." },
      { kind: "added", text: "A publish flow that previews your component before it goes live." },
    ],
  },
  {
    version: "1.0",
    date: "2026-07-24",
    title: "Launch",
    summary:
      "The registry opens: browse live component previews and copy any of them as a single prompt that works in whatever tool you already use.",
    changes: [
      { kind: "added", text: "Live, interactive previews — every component runs in the page rather than showing a screenshot." },
      { kind: "added", text: "One universal prompt per component, with no tool picker: the same text works in Claude Code, Cursor, Lovable, v0, Bolt and Windsurf." },
      { kind: "added", text: "Browse by category, author or collection." },
    ],
  },
]
