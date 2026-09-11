"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Check, Copy, Loader2, Mail, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { inviteMember, removeMember, type SeatSummary, type TeamView } from "@/server/actions/team"
import { cn } from "@/lib/utils"

export function TeamSeats({ team }: { team: TeamView }) {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [invite, setInvite] = React.useState<{ email: string; url: string } | null>(null)

  const full = team.used >= team.totalSeats
  // reducing seats in the billing portal doesn't kick anyone out — that's the
  // owner's call to make, so we surface it rather than acting on it
  const over = team.used > team.totalSeats

  async function send(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    const result = await inviteMember(email)
    setPending(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setInvite(result.data)
    setEmail("")
    router.refresh()
  }

  async function remove(seat: SeatSummary) {
    const result = await removeMember(seat.id)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast(`Removed ${seat.memberEmail ?? seat.email}`)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      {invite && <InviteLink invite={invite} onDismiss={() => setInvite(null)} />}

      {over && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-3.5 py-3 text-[13px] leading-relaxed">
          You have {team.used} people on {team.totalSeats} seat
          {team.totalSeats === 1 ? "" : "s"}. Nobody has been removed — add seats in the billing
          portal, or remove {team.used - team.totalSeats} member
          {team.used - team.totalSeats === 1 ? "" : "s"} below.
        </p>
      )}

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">Invite someone</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          {full
            ? "Every seat is in use. Remove a member, or add seats from the billing portal."
            : "You'll get a link to send them. Anyone who opens it takes the seat, so share it directly."}
        </p>

        <form className="mt-4 flex flex-wrap items-end gap-3" onSubmit={send}>
          <label className="grid min-w-[16rem] flex-1 gap-1.5">
            <span className="text-[13px] font-medium">Email address</span>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="teammate@company.com"
              autoComplete="off"
              disabled={full}
            />
          </label>
          <Button type="submit" disabled={pending || full || email.trim().length === 0} className="gap-2">
            {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Create invite
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold">
          Seats <span className="font-normal text-muted-foreground">({team.used}/{team.totalSeats})</span>
        </h2>

        <ul className="mt-4 divide-y divide-border rounded-lg border border-border">
          <li className="flex items-center gap-3 px-3.5 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">You</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Owner · billed for this seat</p>
            </div>
          </li>

          {team.seats.map((seat) => (
            <li key={seat.id} className="flex flex-wrap items-center gap-3 px-3.5 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">
                  {seat.memberName ?? seat.email}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {seat.status === "active"
                    ? seat.memberEmail ?? seat.email
                    : `Invited ${seat.email}`}
                </p>
              </div>

              <span
                className={cn(
                  "rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                  seat.status === "active"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                )}
              >
                {seat.status === "active" ? "Active" : "Pending"}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-destructive"
                onClick={() => remove(seat)}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            </li>
          ))}
        </ul>

        {team.seats.length === 0 && (
          <p className="mt-3 text-[13px] text-muted-foreground">
            No one else yet — you&apos;re paying for {team.totalSeats} seats.
          </p>
        )}
      </section>
    </div>
  )
}

function InviteLink({
  invite,
  onDismiss,
}: {
  invite: { email: string; url: string }
  onDismiss: () => void
}) {
  const [copied, setCopied] = React.useState(false)

  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-5">
      <p className="flex items-center gap-2 text-[13px] font-medium">
        <Mail className="size-4" />
        Invite for {invite.email}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
        Send this link to them. It works once and expires in 14 days.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto rounded-md bg-background px-3 py-2 font-mono text-[12px]">
          {invite.url}
        </code>
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(invite.url)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch {
              toast.error("Could not reach the clipboard. Select the link and copy it manually.")
            }
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDismiss}>
          Done
        </Button>
      </div>
    </div>
  )
}
