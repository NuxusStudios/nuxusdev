"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FaqItem {
  question: string
  answer: string
}

export function FaqAccordion({
  items,
  title = "Questions, answered",
  description,
}: {
  items: FaqItem[]
  title?: string
  description?: string
}) {
  const [open, setOpen] = React.useState<number | null>(0)

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-14">
      <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
      {description && <p className="mt-2 text-foreground/45">{description}</p>}

      <div className="mt-8 divide-y divide-foreground/10 border-t border-foreground/10">
        {items.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.question}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="flex items-center gap-4">
                  <span className="font-mono text-xs text-foreground/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] font-medium text-foreground">{item.question}</span>
                </span>
                <Plus
                  className={cn(
                    "size-4 shrink-0 text-foreground/40 transition-transform duration-200",
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
                  <p className="pb-5 pl-10 pr-10 text-sm leading-relaxed text-foreground/55">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
