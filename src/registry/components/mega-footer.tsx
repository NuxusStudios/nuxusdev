"use client"

import * as React from "react"
import { Check, Send } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FooterColumn {
  title: string
  links: { label: string; href: string; badge?: string }[]
}

/** Wide footer with a newsletter capture, link columns and a legal row. */
export function MegaFooter({
  brand = "Acme",
  tagline = "The platform for shipping faster.",
  columns,
  className,
}: {
  brand?: string
  tagline?: string
  columns: FooterColumn[]
  className?: string
}) {
  const [email, setEmail] = React.useState("")
  const [sent, setSent] = React.useState(false)

  return (
    <footer className={cn("border-t border-foreground/10 bg-background", className)}>
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex flex-col justify-between gap-8 border-b border-foreground/10 pb-10 lg:flex-row lg:items-end">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
                {brand[0]}
              </span>
              <span className="text-lg font-semibold text-foreground">{brand}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/45">{tagline}</p>
          </div>

          <form
            className="w-full max-w-sm"
            onSubmit={(event) => {
              event.preventDefault()
              setSent(true)
              setTimeout(() => setSent(false), 2400)
            }}
          >
            <label className="text-[13px] font-medium text-foreground/70">Product updates, monthly</label>
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="h-10 flex-1 rounded-lg border border-foreground/12 bg-background/40 px-3 text-sm text-foreground outline-none transition placeholder:text-foreground/25 focus:border-foreground/30"
              />
              <button className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:bg-foreground/90">
                {sent ? <Check className="size-4" /> : <Send className="size-3.5" />}
                {sent ? "Done" : "Join"}
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/35">
                {column.title}
              </h4>
              <ul className="mt-3.5 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-2 text-sm text-foreground/55 transition-colors hover:text-foreground"
                    >
                      {link.label}
                      {link.badge && (
                        <span className="rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                          {link.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-foreground/10 pt-6 text-xs text-foreground/30 sm:flex-row">
          <span>© {new Date().getFullYear()} {brand}, Inc. All rights reserved.</span>
          <span className="flex gap-4">
            <a href="#" className="transition hover:text-foreground/60">Privacy</a>
            <a href="#" className="transition hover:text-foreground/60">Terms</a>
            <a href="#" className="transition hover:text-foreground/60">Status</a>
          </span>
        </div>
      </div>
    </footer>
  )
}
