import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { PricingPlans } from "@/components/pricing/pricing-plans"
import { PricingCompare } from "@/components/pricing/pricing-compare"
import { PricingFaq } from "@/components/pricing/pricing-faq"
import { formatNumber } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Plans & Pricing",
  description:
    "Choose the plan that fits how you build — Builder, Builder + AI, or Team. Unlimited component copies, MCP access and AI credits.",
}

const TEAMS = ["Northwind", "Helio", "Cadence", "Trailhead", "Vireo"]

export default function PricingPage() {
  return (
    <>
      <SiteHeader />

      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(70%_60%_at_50%_-10%,rgba(0,143,233,0.2),transparent_70%)]"
        />

        <div className="container-page relative py-16">
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Pay once you
              <br />
              <span className="text-muted-foreground">actually ship</span>
            </h1>
            <p className="mt-5 text-[17px] text-muted-foreground">
              Browsing and copying are free. Plans add the tooling around them.
            </p>
            <p className="mt-2 text-sm text-muted-foreground/70">
              {formatNumber(8991)} builders on a plan
            </p>
          </div>

          <PricingPlans />

          <p className="mt-8 text-center text-xs text-muted-foreground/70">
            Cancel anytime. Payments are non-refundable.
          </p>

          <div className="mt-16 flex flex-col items-center gap-5">
            <p className="text-sm text-muted-foreground">Used by developers at</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {TEAMS.map((t) => (
                <span key={t} className="text-lg font-semibold tracking-tight text-muted-foreground/45">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <PricingCompare />
          <PricingFaq />
        </div>
      </div>
    </>
  )
}
