import Link from "next/link"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/site-header"
import { JoinTeam } from "@/components/site/join-team"
import { getSession } from "@/server/session"
import { previewInvite } from "@/server/teams"
import { PLANS } from "@/lib/plans"

export const metadata: Metadata = { title: "Join a team", robots: { index: false } }
export const dynamic = "force-dynamic"

const PROBLEM_COPY = {
  expired: "This invite has expired. Ask whoever sent it for a new link.",
  revoked: "This invite was revoked.",
  taken: "This seat has already been claimed.",
  subscription_inactive: "The team's plan is no longer active, so the seat can't be used.",
} as const

export default async function JoinTeamPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const invite = await previewInvite(token)
  const session = await getSession()

  if (!session) redirect(`/sign-in?next=/team/join/${encodeURIComponent(token)}`)

  return (
    <>
      <SiteHeader />
      <div className="container-page max-w-lg py-20">
        <div className="rounded-2xl border border-border bg-card p-7">
          {!invite ? (
            <Message
              title="Invite not found"
              body="That link isn't valid. Check you copied the whole thing, or ask for a new invite."
            />
          ) : invite.problem ? (
            <Message title="This invite can't be used" body={PROBLEM_COPY[invite.problem]} />
          ) : (
            <>
              <h1 className="text-xl font-semibold tracking-tight">
                Join {invite.ownerName ? `${invite.ownerName}'s` : "the"} team
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                Accepting gives your account the {PLANS[invite.plan].name} plan for as long as the
                team&apos;s subscription stays active. The invite was sent to{" "}
                <span className="text-foreground">{invite.email}</span>.
              </p>
              <div className="mt-6">
                <JoinTeam token={token} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <>
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
      <Link
        href="/pricing"
        className="mt-6 inline-block text-[14px] text-foreground underline underline-offset-4"
      >
        See plans
      </Link>
    </>
  )
}
