"use client"

import * as React from "react"
import { ChevronsUpDown, Loader2, Minus, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { startCheckout } from "@/server/actions/billing"
import { CREDIT_TIERS, monthlyPrice, periodTotal, type CreditTier } from "@/lib/pricing"
import { cn } from "@/lib/utils"

export type TeamCycle = "quarterly" | "yearly"

export const TEAM_CREDIT_TIERS = CREDIT_TIERS
export type TeamCreditTier = CreditTier

/** Per-seat monthly price for whichever plan and tier is selected. */
function perSeatPrice(
  plan: "team" | "team_ai",
  cycle: TeamCycle,
  credits: TeamCreditTier
): number {
  return monthlyPrice(plan, cycle, plan === "team_ai" ? credits : undefined)
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

const PERIOD_LABEL: Record<TeamCycle, string> = { quarterly: "3 months", yearly: "year" }

/**
 * Groups thousands and trims a trailing .00, but keeps genuine cents —
 * $1,776 rather than $1776, and $7.50 rather than $7.5.
 */
function money(amount: number): string {
  const hasCents = amount % 1 !== 0
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
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
  const [credits, setCredits] = React.useState<TeamCreditTier>(500)
  const [pending, setPending] = React.useState(false)

  const total = periodTotal(plan, cycle, {
    credits: plan === "team_ai" ? credits : undefined,
    seats,
  })
  const selected = OPTIONS.find((option) => option.id === plan)!
  const isAi = plan === "team_ai"

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
    const result = await startCheckout({
      plan,
      cycle,
      seats,
      credits: isAi ? credits : undefined,
    })
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
                  <p className="mt-0.5 text-[13px] text-muted-foreground">
                    {option.id === "team_ai"
                      ? `${credits.toLocaleString()} credits per seat / month`
                      : option.detail}
                  </p>
                  <p className="mt-3 text-[15px]">
                    {money(perSeatPrice(option.id, cycle, credits))}
                    <span className="text-muted-foreground"> / seat / month</span>
                  </p>
                </button>
              )
            })}

            {isAi && (
              <div className="sm:col-span-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex w-full items-center justify-between rounded-lg border border-border bg-background/60 px-4 py-3 text-left text-[15px] transition-colors hover:border-border-strong">
                      {credits.toLocaleString()} monthly credits
                      <ChevronsUpDown className="size-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-(--radix-dropdown-menu-trigger-width) p-1.5"
                  >
                    {TEAM_CREDIT_TIERS.map((tier) => (
                      <DropdownMenuItem
                        key={tier}
                        onSelect={() => setCredits(tier)}
                        className={cn(
                          "flex justify-between px-3 py-2.5 text-[15px]",
                          tier === credits && "bg-brand/10 text-brand focus:bg-brand/15 focus:text-brand"
                        )}
                      >
                        <span>{tier.toLocaleString()} credits</span>
                        <span className={tier === credits ? "" : "text-muted-foreground"}>
                          {money(monthlyPrice("team_ai", cycle, tier))}/mo
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
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
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {isAi
                    ? `${credits.toLocaleString()} monthly credits per seat`
                    : selected.detail}
                </p>
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
