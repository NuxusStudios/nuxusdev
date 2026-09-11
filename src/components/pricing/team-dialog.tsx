"use client"

import * as React from "react"
import { Loader2, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { startCheckout } from "@/server/actions/billing"
import { cn } from "@/lib/utils"

export type TeamCycle = "quarterly" | "yearly"

/** Per-seat monthly price for each team plan, by billing cycle. */
export const TEAM_PRICES: Record<"team" | "team_ai", Record<TeamCycle, number>> = {
  team: { quarterly: 9, yearly: 7 },
  team_ai: { quarterly: 21, yearly: 16 },
}

const OPTIONS = [
  {
    id: "team" as const,
    name: "Team Builder",
    detail: "No monthly AI credits",
  },
  {
    id: "team_ai" as const,
    name: "Team Builder + AI",
    detail: "500 credits per seat / month",
  },
]

const MIN_SEATS = 2
const MAX_SEATS = 50

/** Months billed up front for each cycle. */
const MONTHS: Record<TeamCycle, number> = { quarterly: 3, yearly: 12 }
const PERIOD_LABEL: Record<TeamCycle, string> = { quarterly: "3 months", yearly: "year" }

/** Trims a trailing .00 but keeps genuine cents — $7.50 stays, $180.00 doesn't. */
function money(amount: number): string {
  return `$${amount % 1 === 0 ? amount : amount.toFixed(2)}`
}

/**
 * The parent remounts this with a key each time it opens, so every purchase
 * starts from the default. Carrying a previous selection into a checkout risks
 * someone buying the AI tier because they poked at it earlier and closed it.
 */
export function TeamDialog({
  open,
  onOpenChange,
  cycle,
  signedIn,
  billingEnabled,
  onNeedsAccount,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  cycle: TeamCycle
  signedIn: boolean
  billingEnabled: boolean
  onNeedsAccount: () => void
}) {
  const [plan, setPlan] = React.useState<"team" | "team_ai">("team")
  const [seats, setSeats] = React.useState(MIN_SEATS)
  const [pending, setPending] = React.useState(false)

  const perSeat = TEAM_PRICES[plan][cycle]
  const total = perSeat * seats * MONTHS[cycle]
  const selected = OPTIONS.find((option) => option.id === plan)!

  async function submit() {
    if (!signedIn) {
      onNeedsAccount()
      return
    }
    if (!billingEnabled) {
      toast.error("Billing isn't switched on yet.")
      return
    }

    setPending(true)
    const result = await startCheckout({ plan, cycle, seats })
    setPending(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }
    window.location.assign(result.data.url)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="p-6 pb-5">
          <DialogTitle className="text-2xl">Start your team</DialogTitle>
          <DialogDescription className="text-[15px]">
            Choose the seat count and one plan for the whole team.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          <h3 className="text-[15px] font-semibold">Choose a plan</h3>

          <div className="mt-3 grid gap-2 rounded-xl bg-secondary/40 p-2 sm:grid-cols-2">
            {OPTIONS.map((option) => {
              const active = option.id === plan
              return (
                <button
                  key={option.id}
                  onClick={() => setPlan(option.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    active
                      ? "border-brand bg-brand/[0.07]"
                      : "border-border bg-background/40 hover:border-border-strong"
                  )}
                >
                  <p className="text-[15px] font-medium">{option.name}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{option.detail}</p>
                  <p className="mt-3 text-[15px]">
                    {money(TEAM_PRICES[option.id][cycle])}
                    <span className="text-muted-foreground"> / seat / month</span>
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-6 pb-6 pt-6">
          <h3 className="text-[15px] font-semibold">Order details</h3>

          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between gap-4 border-b border-border p-5">
              <div>
                <p className="text-[15px] font-medium">Seats</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  One plan applies to every team member.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Remove a seat"
                  disabled={seats <= MIN_SEATS}
                  onClick={() => setSeats((current) => Math.max(MIN_SEATS, current - 1))}
                >
                  <Minus />
                </Button>
                <span className="w-8 text-center text-lg tabular-nums">{seats}</span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Add a seat"
                  disabled={seats >= MAX_SEATS}
                  onClick={() => setSeats((current) => Math.min(MAX_SEATS, current + 1))}
                >
                  <Plus />
                </Button>
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <p className="text-[15px] font-medium">{selected.name}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{selected.detail}</p>
              </div>
              <div className="text-right">
                <p className="text-[13px] text-muted-foreground">Total</p>
                <p className="text-xl font-semibold tabular-nums">
                  {money(total)}{" "}
                  <span className="font-normal text-muted-foreground">
                    / {PERIOD_LABEL[cycle]}
                  </span>
                </p>
              </div>
            </div>

            <p className="p-5 text-[13px] leading-relaxed text-muted-foreground">
              One selected plan applies to all {seats} seats. Tax is calculated at checkout.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border p-5">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending} className="gap-2">
            {pending && <Loader2 className="size-4 animate-spin" />}
            Continue · {money(total)} for {seats} seats
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
