import { Check, Minus, Play, Sparkles } from "lucide-react"
import { Marquee } from "@/registry/components/marquee"
import { GradientOrbs } from "@/registry/components/gradient-orbs"
import { PricingSection } from "@/registry/components/pricing-section"
import { MegaFooter } from "@/registry/components/mega-footer"

/**
 * The modern AI-product landing page, as a template.
 *
 * Follows the shape this genre has settled on — badge, a headline whose last
 * line carries the accent, twin calls to action, an integration strip, a
 * browser-framed product shot, a numbered workflow, a before/after and a
 * comparison table — but every surface is a theme token, so it arrives in the
 * project's own palette rather than the violet every one of these ships in.
 */

const integrations = [
  "Postgres", "Stripe", "Slack", "Linear", "Notion", "GitHub", "Segment", "Snowflake",
]

const tabs = [
  { label: "Overview", path: "app.example.com/overview" },
  { label: "Assistant", path: "app.example.com/assistant" },
  { label: "Schedule", path: "app.example.com/schedule" },
  { label: "Reports", path: "app.example.com/reports" },
]

const workflow = [
  {
    step: "01",
    title: "Describe the work",
    body: "Type it, say it, or send a photo. The draft comes back with line items, rates and the terms you always forget.",
    mock: (
      <dl className="space-y-2 text-[13px]">
        {[
          ["Site survey, 2 hrs", "240.00"],
          ["Materials", "1,140.00"],
          ["Installation, 4.5 hrs", "382.50"],
        ].map(([label, amount]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums">{amount}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-border pt-2 font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">1,762.50</dd>
        </div>
      </dl>
    ),
  },
  {
    step: "02",
    title: "Send it as a link",
    body: "No attachment, no mailbox. They open it, sign it, and the job is created before you have put the van in gear.",
    mock: (
      <div className="flex h-full flex-col justify-center gap-3">
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-[12px] text-muted-foreground">
          example.com/q/8f21c4
        </div>
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Check className="size-4 text-emerald-500" />
          Signed · 14:22
        </p>
      </div>
    ),
  },
  {
    step: "03",
    title: "Plan and track",
    body: "Assign it, move it, clock in against it. Hours land on the job rather than on a piece of paper in someone's pocket.",
    mock: (
      <div className="grid grid-cols-4 gap-1.5 text-[11px]">
        {["Mon", "Tue", "Wed", "Thu"].map((day, i) => (
          <div key={day} className="space-y-1.5">
            <p className="text-muted-foreground">{day}</p>
            {Array.from({ length: i === 1 ? 2 : 1 }).map((_, j) => (
              <div key={j} className="rounded-md bg-primary/15 px-1.5 py-2 text-primary">
                Job
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "04",
    title: "Invoice and export",
    body: "One click turns the job into an invoice in the format your accountant expects, and hands it over.",
    mock: (
      <div className="flex h-full flex-wrap content-center gap-2">
        {["Invoice", "E-invoice", "Ledger export", "Paid"].map((label) => (
          <span
            key={label}
            className="rounded-full border border-border px-2.5 py-1 text-[12px] text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>
    ),
  },
]

const before = [
  "30–60 minutes per quote",
  "Evenings at the desk after a full day",
  "Prices and terms retyped, and mistyped",
]

const after = [
  "A draft back in under a minute",
  "Signed on site, before you leave",
  "Terms and rates applied the same way every time",
]

const comparison: { feature: string; us: boolean | string; sheets: boolean | string; legacy: boolean | string }[] = [
  { feature: "Quote drafted in under a minute", us: true, sheets: false, legacy: "Rarely" },
  { feature: "Compliant archiving", us: true, sheets: false, legacy: true },
  { feature: "Signature on site", us: true, sheets: false, legacy: "Partial" },
  { feature: "Scheduling in the same system", us: true, sheets: false, legacy: false },
  { feature: "Hours tracked against the job", us: true, sheets: false, legacy: "Add-on" },
  { feature: "Ledger export", us: true, sheets: false, legacy: true },
  { feature: "Running in", us: "10 minutes", sheets: true, legacy: "Weeks" },
]

const tiers = [
  { name: "Solo", price: { monthly: 29, yearly: 24 }, description: "One person, everything included.", cta: "Start free", features: ["Unlimited quotes", "Digital signature", "Ledger export"] },
  { name: "Crew", price: { monthly: 69, yearly: 55 }, description: "Up to ten on the tools.", cta: "Start free", popular: true, features: ["Everything in Solo", "Scheduling", "Time tracking", "Priority support"] },
  { name: "Company", price: { monthly: 149, yearly: 119 }, description: "Multiple crews and offices.", cta: "Talk to us", features: ["Everything in Crew", "SSO", "Audit log", "Onboarding"] },
]

const footer = [
  { title: "Product", links: [{ label: "Workflow", href: "#" }, { label: "Pricing", href: "#" }, { label: "Changelog", href: "#" }] },
  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }] },
  { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Security", href: "#" }] },
]

function Mark({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="mx-auto size-4 text-emerald-500" />
  if (value === false) return <Minus className="mx-auto size-4 text-muted-foreground/50" />
  return <span className="text-[13px] text-muted-foreground">{value}</span>
}

export default function AiPlatformTemplate() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border">
        <GradientOrbs intensity={0.4} />

        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[12px] text-muted-foreground backdrop-blur">
            <Sparkles className="size-3.5" />
            Now with on-device drafting
          </span>

          {/* the genre's signature: the last line carries the accent */}
          <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Win the job faster.
            <br />
            Describe it once.
            <br />
            <span className="text-primary">Everything else follows.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            Say what the work is and get a quote back ready to sign. Scheduling, hours and the
            invoice come out the other end without retyping anything.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Start 7 days free
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Play className="size-3.5" />
              Watch a demo
            </a>
          </div>

          <p className="mt-4 text-[12px] text-muted-foreground">
            No card required · Share by link · Signed digitally
          </p>
        </div>
      </section>

      <section className="border-b border-border py-5">
        <Marquee pauseOnHover className="[--duration:32s]">
          {integrations.map((name) => (
            <span key={name} className="mx-6 text-[13px] text-muted-foreground">
              {name}
            </span>
          ))}
        </Marquee>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Your business, one screen</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Quotes, planning, hours and the assistant — live, and in the same place.
          </p>
        </div>

        {/* browser chrome, because a product shot without it reads as a mockup */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              {["bg-rose-400/60", "bg-amber-400/60", "bg-emerald-400/60"].map((tone) => (
                <span key={tone} className={`size-2.5 rounded-full ${tone}`} />
              ))}
            </span>
            <span className="truncate rounded-md bg-muted/60 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
              {tabs[0].path}
            </span>
          </div>

          <div className="flex flex-wrap gap-1 border-b border-border px-3 py-2">
            {tabs.map((tab, i) => (
              <span
                key={tab.label}
                className={
                  i === 0
                    ? "rounded-md bg-muted px-2.5 py-1 text-[12px] font-medium"
                    : "rounded-md px-2.5 py-1 text-[12px] text-muted-foreground"
                }
              >
                {tab.label}
              </span>
            ))}
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3">
            {[
              ["Open jobs", "18"],
              ["Awaiting signature", "4"],
              ["Invoiced this month", "42,180"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border p-4">
                <p className="text-[12px] text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          The workflow
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          First conversation to final invoice
        </h2>

        <div className="mt-10 space-y-4">
          {workflow.map((item) => (
            <article
              key={item.step}
              className="grid gap-6 rounded-2xl border border-border bg-card p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            >
              <div>
                <span className="font-mono text-[12px] text-muted-foreground">{item.step}</span>
                <h3 className="mt-2 text-lg font-medium">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4">{item.mock}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          The same job, both ways
        </h2>

        <div className="mt-9 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-6">
            <h3 className="text-[15px] font-medium text-muted-foreground">On your own</h3>
            <ul className="mt-4 space-y-3">
              {before.map((line) => (
                <li key={line} className="flex gap-2.5 text-[14px] text-muted-foreground">
                  <Minus className="mt-0.5 size-4 shrink-0" />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <h3 className="text-[15px] font-medium">With the platform</h3>
            <ul className="mt-4 space-y-3">
              {after.map((line) => (
                <li key={line} className="flex gap-2.5 text-[14px]">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight">Against the alternatives</h2>

        {/* the table scrolls itself rather than pushing the page sideways */}
        <div className="mt-9 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="px-4 py-3 text-left font-medium">Feature</th>
                <th scope="col" className="px-4 py-3 font-medium">This platform</th>
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">Spreadsheets</th>
                <th scope="col" className="px-4 py-3 font-medium text-muted-foreground">Legacy software</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature} className="border-b border-border last:border-0">
                  <th scope="row" className="px-4 py-3 text-left font-normal text-muted-foreground">
                    {row.feature}
                  </th>
                  <td className="px-4 py-3 text-center"><Mark value={row.us} /></td>
                  <td className="px-4 py-3 text-center"><Mark value={row.sheets} /></td>
                  <td className="px-4 py-3 text-center"><Mark value={row.legacy} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <PricingSection tiers={tiers} />

      <MegaFooter brand="Platform" tagline="Quote, schedule, invoice." columns={footer} />
    </div>
  )
}
