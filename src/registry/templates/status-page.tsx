import { StatusBadge, type StatusTone } from "@/registry/components/status-badge"
import { Timeline } from "@/registry/components/timeline"
import { StatsSection } from "@/registry/components/stats-section"
import { MegaFooter } from "@/registry/components/mega-footer"

/**
 * A public status page.
 *
 * Uses theme tokens throughout, so it takes on whichever palette the project
 * already has rather than shipping its own dark grey.
 */

// typed rather than inferred: narrowing to the tones that happen to be in
// this sample would make the check below dead code the moment one changes
const services: { name: string; tone: StatusTone; uptime: string }[] = [
  { name: "API", tone: "operational", uptime: "99.99%" },
  { name: "Dashboard", tone: "operational", uptime: "99.98%" },
  { name: "Webhooks", tone: "degraded", uptime: "99.51%" },
  { name: "CLI & registry", tone: "operational", uptime: "100%" },
  { name: "Background jobs", tone: "maintenance", uptime: "99.87%" },
]

const incidents = [
  {
    title: "Webhook delivery delayed",
    date: "Today, 14:20 UTC",
    description: "Retries are queued behind a backlog. Deliveries are arriving late, none are lost.",
    status: "current" as const,
  },
  {
    title: "Scheduled maintenance — background jobs",
    date: "Today, 02:00 UTC",
    description: "Queue workers were drained and replaced. No customer-visible impact.",
    status: "done" as const,
  },
  {
    title: "Elevated API latency",
    date: "Sep 9, 11:05 UTC",
    description: "A slow query in the search path added roughly 400ms to p95 for 26 minutes.",
    status: "done" as const,
  },
]

const stats = [
  { value: 99.98, suffix: "%", decimals: 2, label: "Uptime, 90 days" },
  { value: 142, suffix: "ms", label: "p95 response" },
  { value: 3, label: "Incidents this quarter" },
  // the grid is four wide; three stats leave an empty cell
  { value: 18, suffix: " min", label: "Mean time to recovery" },
]

const footer = [
  { title: "Status", links: [{ label: "History", href: "#" }, { label: "Subscribe", href: "#" }, { label: "RSS", href: "#" }] },
  { title: "Product", links: [{ label: "Docs", href: "#" }, { label: "Changelog", href: "#" }, { label: "API", href: "#" }] },
  { title: "Support", links: [{ label: "Contact", href: "#" }, { label: "Help centre", href: "#" }] },
]

export default function StatusPageTemplate() {
  // one degraded service means the headline cannot claim all-clear
  const worst = services.some((s) => s.tone === "degraded" || s.tone === "down")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-8">
          <div>
            <p className="text-[13px] text-muted-foreground">Northwind</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">System status</h1>
          </div>
          <StatusBadge tone={worst ? "degraded" : "operational"} pulse />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <StatsSection stats={stats} />

        <section className="mt-12">
          <h2 className="text-[15px] font-semibold">Services</h2>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {services.map((service) => (
              <li key={service.name} className="flex items-center justify-between gap-4 px-4 py-3.5">
                <span className="text-sm font-medium">{service.name}</span>
                <span className="flex items-center gap-3">
                  <span className="text-[13px] tabular-nums text-muted-foreground">
                    {service.uptime}
                  </span>
                  <StatusBadge tone={service.tone} />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-[15px] font-semibold">Recent incidents</h2>
          <div className="mt-4">
            <Timeline entries={incidents} />
          </div>
        </section>
      </main>

      <MegaFooter brand="Northwind" tagline="Status and incident history." columns={footer} />
    </div>
  )
}
