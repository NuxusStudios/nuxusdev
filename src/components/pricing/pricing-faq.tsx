"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: "What does Builder include?",
    a: "Unlimited component and prompt copies, icon search, MCP and CLI access, and unlimited installs. It's the full marketplace without AI generation credits.",
  },
  {
    q: "Is Design Bug Bot included in my plan?",
    a: "Every paid plan gets 5 free successful PR reviews in the first 7 days. After that, Builder + AI (or Team + AI) keeps it running on AI credits.",
  },
  {
    q: "How does Team pricing work?",
    a: "Team is billed per seat, from 2 to 50 seats, with centralized billing, shared collections and admin controls. AI credits are optional per seat.",
  },
  {
    q: "What happens when I run out of AI credits?",
    a: "Generation pauses until the next monthly refill. You can top up 100 credits for $5 at any time and unused top-ups roll over.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Your plan stays active until the end of the billing period. Payments already made are non-refundable.",
  },
]

export function PricingFaq() {
  const [open, setOpen] = React.useState<number | null>(null)

  return (
    <section className="mt-20 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Frequently Asked Questions</h2>
        <p className="mt-2 text-sm text-muted-foreground">Everything you need to know</p>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="text-[15px] font-medium">{item.q}</span>
                <Plus
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-45"
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid transition-all duration-300 ease-out",
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
              >
                <div className="overflow-hidden">
                  <p className="pb-5 pr-6 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
