"use client"

import { cn } from "@/lib/utils"

export interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

export function FooterSection({
  columns,
  brand = "Acme",
  tagline = "The living library of interfaces.",
  className,
}: {
  columns: FooterColumn[]
  brand?: string
  tagline?: string
  className?: string
}) {
  return (
    <footer className={cn("w-full border-t border-foreground/10 bg-background px-6 py-14", className)}>
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-sm font-bold text-background">
              {brand[0]}
            </div>
            <span className="text-base font-semibold text-foreground">{brand}</span>
          </div>
          <p className="max-w-[26ch] text-sm text-foreground/40">{tagline}</p>
          <div className="mt-2 flex gap-2">
            {["X", "GH", "in"].map((s) => (
              <a
                key={s}
                href="#"
                className="flex size-8 items-center justify-center rounded-lg border border-foreground/10 text-xs text-foreground/50 transition hover:border-foreground/25 hover:text-foreground"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/35">
              {col.title}
            </h4>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-foreground/55 transition hover:text-foreground">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-5xl flex-col items-center justify-between gap-3 border-t border-foreground/10 pt-6 text-xs text-foreground/30 sm:flex-row">
        <span>© {new Date().getFullYear()} {brand}, Inc.</span>
        <span className="flex gap-4">
          <a href="#" className="transition hover:text-foreground/60">Privacy</a>
          <a href="#" className="transition hover:text-foreground/60">Terms</a>
        </span>
      </div>
    </footer>
  )
}
