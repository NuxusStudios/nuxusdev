import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { PricingPlans } from "@/components/pricing/pricing-plans"
import { CatalogueStrip } from "@/components/pricing/catalogue-strip"
import { PricingCompare } from "@/components/pricing/pricing-compare"
import { PricingFaq } from "@/components/pricing/pricing-faq"
import { getEntitlements } from "@/server/entitlements"
import { providers } from "@/server/env"
import { purchasablePlans } from "@/server/stripe"

export const metadata: Metadata = {
  title: "Plans & Pricing",
  description:
    "Choose the plan that fits how you build — Builder, Builder + AI, or Team. Unlimited component copies, MCP access and AI credits.",
}

export default async function PricingPage() {
  const entitlements = await getEntitlements()

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
              Cancel anytime · 16 components added this month
            </p>
          </div>

          <PricingPlans
            currentPlan={entitlements.plan.id}
            signedIn={entitlements.signedIn}
            billingEnabled={providers.billing}
            purchasable={providers.billing ? purchasablePlans() : []}
          />

          <p className="mt-8 text-center text-xs text-muted-foreground/70">
            Cancel anytime. Payments are non-refundable.
          </p>

          <CatalogueStrip />
          <PricingCompare />
          <PricingFaq />
        </div>
      </div>
    </>
  )
}
