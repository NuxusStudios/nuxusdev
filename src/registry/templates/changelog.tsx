"use client"

import { Timeline, type TimelineEntry } from "@/registry/components/timeline"
import { StatusBadge } from "@/registry/components/status-badge"
import { FooterSection } from "@/registry/components/footer-section"

const entries: TimelineEntry[] = [
  { title: "Realtime collaboration", date: "Mar 18", status: "current", description: "Multiple cursors, presence and conflict-free edits across every document." },
  { title: "Audit log", date: "Mar 04", status: "done", description: "Every write recorded with actor, IP and diff. Exportable as CSV or streamed to your SIEM." },
  { title: "SSO with SAML", date: "Feb 21", status: "done", description: "Okta, Entra and Google Workspace, with SCIM provisioning behind the same switch." },
  { title: "Faster cold starts", date: "Feb 09", status: "done", description: "Median cold start down from 840ms to 120ms by moving the runtime closer to the edge." },
  { title: "Usage-based billing", date: "Soon", status: "upcoming", description: "Meter any dimension and let Stripe handle proration." },
]

const columns = [
  { title: "Product", links: [{ label: "Changelog", href: "#" }, { label: "Roadmap", href: "#" }, { label: "Status", href: "#" }] },
  { title: "Developers", links: [{ label: "Docs", href: "#" }, { label: "API", href: "#" }, { label: "SDKs", href: "#" }] },
  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#" }] },
]

export default function ChangelogTemplate() {
  return (
    <div className="bg-zinc-950">
      <section className="mx-auto max-w-3xl px-6 pt-20 text-center">
        <StatusBadge tone="operational" label="All systems normal" />
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white md:text-6xl">Changelog</h1>
        <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-white/50">
          Everything we ship, in the order we shipped it. Subscribe and we&apos;ll email you when
          something meaningful lands.
        </p>
        <form className="mx-auto mt-8 flex max-w-sm gap-2" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="you@company.com"
            className="h-10 flex-1 rounded-lg border border-white/12 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/30"
          />
          <button className="h-10 rounded-lg bg-white px-4 text-sm font-medium text-black">Subscribe</button>
        </form>
      </section>

      <Timeline entries={entries} className="mt-6" />

      <FooterSection columns={columns} brand="Acme" tagline="Shipping since 2019." />
    </div>
  )
}
