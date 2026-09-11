import Link from "next/link"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/site-header"
import { SettingsForms } from "@/components/site/settings-forms"
import { TokenManager } from "@/components/site/token-manager"
import { getSession } from "@/server/session"
import { getEntitlements } from "@/server/entitlements"
import { hasPassword, readProfile } from "@/server/actions/profile"
import { getTokens } from "@/server/actions/tokens"
import { BrandThemeForm } from "@/components/site/brand-theme-form"
import { getBrandTheme } from "@/server/brand-theme"
import { providers } from "@/server/env"

export const metadata: Metadata = { title: "Settings" }
export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect("/sign-in?next=/settings")

  const [profile, entitlements, credentials, tokens, brandTheme] = await Promise.all([
    readProfile(),
    getEntitlements(),
    hasPassword(),
    getTokens(),
    getBrandTheme(session.user.id),
  ])

  if (!profile) redirect("/sign-in")

  return (
    <>
      <SiteHeader />
      <div className="container-page max-w-3xl py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Your profile is public at{" "}
          {profile.handle ? (
            <Link href={`/@${profile.handle}`} className="text-foreground underline-offset-4 hover:underline">
              /@{profile.handle}
            </Link>
          ) : (
            "your handle"
          )}
          .
        </p>

        <SettingsForms
          profile={{
            name: profile.name,
            email: profile.email,
            emailVerified: profile.emailVerified,
            handle: profile.handle ?? "",
            bio: profile.bio ?? "",
            website: profile.website ?? "",
            location: profile.location ?? "",
            twitterUsername: profile.twitterUsername ?? "",
          }}
          plan={{ id: entitlements.plan.id, name: entitlements.plan.name, aiCredits: entitlements.aiCredits }}
          hasPassword={credentials}
          emailConfigured={providers.email}
          billingEnabled={providers.billing}
          brandTheme={
            <section id="brand-theme" className="scroll-mt-24 rounded-2xl border border-border bg-card p-6">
              <h2 className="text-[15px] font-semibold">Your theme</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Paste your design tokens once and every preview on the site renders in your brand,
                so you see a component in your own product before you copy it.
              </p>
              <div className="mt-5">
                <BrandThemeForm
                  saved={
                    brandTheme
                      ? {
                          name: brandTheme.name,
                          coverage: brandTheme.coverage,
                          updatedAt: brandTheme.updatedAt.toISOString(),
                        }
                      : null
                  }
                />
              </div>
            </section>
          }
          tokens={
            <section className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-[15px] font-semibold">Access tokens</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                A terminal has no browser session, so the CLI and MCP server authenticate with a
                personal access token instead. Tokens carry your plan — treat them like a password.
              </p>
              <div className="mt-5">
                <TokenManager
                  canUseRegistryApi={entitlements.canUseRegistryApi}
                  initialTokens={tokens.ok ? tokens.data : []}
                />
              </div>
            </section>
          }
        />
      </div>
    </>
  )
}
