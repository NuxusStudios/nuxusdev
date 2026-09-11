import Link from "next/link"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/site-header"
import { TeamSeats } from "@/components/site/team-seats"
import { Button } from "@/components/ui/button"
import { getSession } from "@/server/session"
import { getTeam } from "@/server/actions/team"

export const metadata: Metadata = { title: "Team" }
export const dynamic = "force-dynamic"

export default async function TeamPage() {
  const session = await getSession()
  if (!session) redirect("/sign-in?next=/team")

  const result = await getTeam()
  const team = result.ok ? result.data : null

  return (
    <>
      <SiteHeader />
      <div className="container-page max-w-3xl py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Team</h1>

        {team ? (
          <>
            <p className="mt-2 text-[15px] text-muted-foreground">
              {team.used} of {team.totalSeats} seat{team.totalSeats === 1 ? "" : "s"} in use. Each
              member gets your plan for as long as the subscription is active.
            </p>
            <div className="mt-8">
              <TeamSeats team={team} />
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-[15px] font-semibold">No team plan</h2>
            <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-muted-foreground">
              Team plans are billed per seat, and let you invite the rest of your team so everyone
              copies components with your plan. If you already hold a seat on someone else&apos;s
              team, you have their plan — nothing to manage here.
            </p>
            <Button asChild className="mt-5">
              <Link href="/pricing">See team pricing</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
