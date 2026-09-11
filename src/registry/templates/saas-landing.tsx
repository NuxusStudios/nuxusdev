import { AnimatedHero } from "@/registry/components/animated-hero"
import { BentoCard, BentoGrid } from "@/registry/components/bento-grid"
import { PricingSection } from "@/registry/components/pricing-section"
import { FooterSection } from "@/registry/components/footer-section"
import { Marquee } from "@/registry/components/marquee"
import { Bell, Calendar, FileText, Globe, Search } from "lucide-react"

const features = [
  { name: "Save your files", description: "We save as you type.", icon: <FileText className="size-4" />, className: "col-span-3 lg:col-span-2" },
  { name: "Full text search", description: "Search everything at once.", icon: <Search className="size-4" />, className: "col-span-3 lg:col-span-1" },
  { name: "Multilingual", description: "100+ languages.", icon: <Globe className="size-4" />, className: "col-span-3 lg:col-span-1" },
  { name: "Calendar", description: "Filter files by date.", icon: <Calendar className="size-4" />, className: "col-span-3 lg:col-span-1" },
  { name: "Notifications", description: "Know when things change.", icon: <Bell className="size-4" />, className: "col-span-3 lg:col-span-1" },
]

const tiers = [
  { name: "Hobby", price: { monthly: 0, yearly: 0 }, description: "For side projects.", cta: "Start free", features: ["3 projects", "Community support"] },
  { name: "Pro", price: { monthly: 24, yearly: 18 }, description: "For working developers.", cta: "Get Pro", popular: true, features: ["Unlimited projects", "Priority support", "Custom domains"] },
  { name: "Team", price: { monthly: 60, yearly: 45 }, description: "For growing teams.", cta: "Get Team", features: ["Everything in Pro", "SSO & SAML", "Admin controls"] },
]

const columns = [
  { title: "Product", links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }, { label: "Changelog", href: "#" }] },
  { title: "Resources", links: [{ label: "Docs", href: "#" }, { label: "Guides", href: "#" }, { label: "API", href: "#" }] },
  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#" }] },
]

export default function SaasLandingTemplate() {
  return (
    <div className="bg-zinc-950">
      <AnimatedHero
        heading="Ship something"
        titles={["fast", "polished", "durable", "yours"]}
        description="A complete starter with a hero, feature grid, pricing and footer — all wired to the same tokens."
      />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <Marquee pauseOnHover className="[--duration:26s]">
          {["Northwind", "Helio", "Cadence", "Trailhead", "Vireo", "Lumafold"].map((n) => (
            <span key={n} className="px-6 text-xl font-semibold text-white/25">{n}</span>
          ))}
        </Marquee>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <BentoGrid>
          {features.map((f) => (
            <BentoCard key={f.name} {...f} />
          ))}
        </BentoGrid>
      </section>

      <PricingSection tiers={tiers} title="Pricing that scales with you" />
      <FooterSection columns={columns} brand="Northwind" tagline="The starter you actually ship." />
    </div>
  )
}
