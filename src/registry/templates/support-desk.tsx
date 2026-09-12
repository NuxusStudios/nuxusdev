import { Search, BookOpen, CreditCard, Plug, Settings, ShieldCheck, MessageCircle } from "lucide-react"
import { FaqAccordion } from "@/registry/components/faq-accordion"
import { MegaFooter } from "@/registry/components/mega-footer"
import { DotPattern } from "@/registry/components/dot-pattern"

/**
 * A help centre: search, categories, popular articles and a way through to a
 * human. Built from theme tokens so it inherits the product's palette.
 */

const categories = [
  { icon: BookOpen, title: "Getting started", count: 18, blurb: "Install, configure and ship your first change." },
  { icon: CreditCard, title: "Billing & plans", count: 12, blurb: "Invoices, seats, upgrades and refunds." },
  { icon: Plug, title: "Integrations", count: 24, blurb: "Connect the tools you already run." },
  { icon: Settings, title: "Account", count: 9, blurb: "Profile, security and team access." },
  { icon: ShieldCheck, title: "Security", count: 7, blurb: "SSO, audit logs and data handling." },
  { icon: MessageCircle, title: "Troubleshooting", count: 21, blurb: "When something is not behaving." },
]

const popular = [
  "Why is my webhook returning 401?",
  "Moving a project between teams",
  "Rotating an API key without downtime",
  "Understanding seat-based billing",
  "Setting up SSO with Okta",
]

const faqs = [
  { question: "How quickly do you reply?", answer: "Within one business day on every plan, and within two hours on Team during working hours." },
  { question: "Can I talk to a person?", answer: "Yes. Every ticket is read by an engineer, and complex ones get a call rather than a thread." },
  { question: "Do you support self-hosting?", answer: "On Team plans. The deployment guide covers Docker, Kubernetes and a single-VM setup." },
  { question: "What happens to my data if I cancel?", answer: "It stays available to export for 30 days, then it is deleted. Nothing is kept quietly." },
]

const footer = [
  { title: "Help", links: [{ label: "Guides", href: "#" }, { label: "API reference", href: "#" }, { label: "Status", href: "#" }] },
  { title: "Community", links: [{ label: "Discord", href: "#" }, { label: "GitHub", href: "#" }] },
  { title: "Contact", links: [{ label: "Email support", href: "#" }, { label: "Book a call", href: "#", badge: "Team" }] },
]

export default function SupportDeskTemplate() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative overflow-hidden border-b border-border">
        <DotPattern className="[mask-image:radial-gradient(420px_circle_at_center,white,transparent)]" />

        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">How can we help?</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            Search the guides, or skip straight to a person — both are on every plan.
          </p>

          <div className="relative mt-7">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search articles…"
              aria-label="Search the help centre"
              className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <ul className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[13px] text-muted-foreground">
            <li>Popular:</li>
            {popular.slice(0, 3).map((item) => (
              <li key={item}>
                <a href="#" className="rounded-full border border-border px-2.5 py-1 transition-colors hover:text-foreground">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-[15px] font-semibold">Browse by topic</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <li key={category.title}>
                <a
                  href="#"
                  className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
                >
                  <Icon className="size-5 text-muted-foreground" />
                  <h3 className="mt-3 text-[15px] font-medium">{category.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{category.blurb}</p>
                  <span className="mt-auto pt-4 text-[12px] text-muted-foreground">
                    {category.count} articles
                  </span>
                </a>
              </li>
            )
          })}
        </ul>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <section>
            <h2 className="text-[15px] font-semibold">Most read</h2>
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
              {popular.map((item) => (
                <li key={item}>
                  <a href="#" className="block px-4 py-3.5 text-sm transition-colors hover:bg-muted/40">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <FaqAccordion title="Before you write in" items={faqs} />
        </div>
      </main>

      <MegaFooter brand="Northwind" tagline="Help centre and support." columns={footer} />
    </div>
  )
}
