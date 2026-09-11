import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Check } from "lucide-react"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { getEntitlements } from "@/server/entitlements"
import { BRAND } from "@/lib/brand"

export const metadata: Metadata = { title: "You're all set" }

// entitlement depends on a webhook that may still be in flight
export const dynamic = "force-dynamic"

export default async function BillingSuccessPage() {
  const entitlements = await getEntitlements()
  const active = entitlements.canCopy

  return (
    <>
      <SiteHeader />
      <div className="container-page flex flex-col items-center py-28 text-center">
        <span
          className={
            active
              ? "flex size-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "flex size-12 items-center justify-center rounded-full border border-border bg-secondary/50 text-muted-foreground"
          }
        >
          <Check className="size-6" />
        </span>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">
          {active ? `Welcome to ${entitlements.plan.name}` : "Payment received"}
        </h1>

        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          {active
            ? `Every component is yours to copy — source, prompts and CLI commands, across the whole registry.`
            : `Stripe has your payment. ${BRAND.name} is waiting on confirmation, which usually lands within a few seconds. Refresh this page in a moment.`}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild className="gap-1.5">
            <Link href="/community/components/featured">
              Browse the registry
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/pricing">{active ? "Manage billing" : "Refresh"}</Link>
          </Button>
        </div>

        {!active && (
          <p className="mt-8 max-w-sm text-xs leading-relaxed text-muted-foreground/70">
            Still not active after a minute? Your payment is safe — contact support and we&apos;ll
            sort it out.
          </p>
        )}
      </div>
    </>
  )
}
