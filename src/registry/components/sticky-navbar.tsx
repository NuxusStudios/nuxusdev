"use client"

import * as React from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavLink {
  label: string
  href: string
}

/** Header that condenses once the page scrolls, with a mobile sheet. */
export function StickyNavbar({
  brand = "Acme",
  links,
  cta = "Get started",
}: {
  brand?: string
  links: NavLink[]
  cta?: string
}) {
  const [scrolled, setScrolled] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-foreground/10 bg-background/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between px-6 transition-all duration-300",
          scrolled ? "h-14" : "h-20"
        )}
      >
        <a href="#" className="flex items-center gap-2 text-foreground">
          <span className="flex size-7 items-center justify-center rounded-lg bg-foreground text-sm font-bold text-background">
            {brand[0]}
          </span>
          <span className="text-[15px] font-semibold tracking-tight">{brand}</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button className="hidden h-9 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:bg-foreground/90 sm:inline-flex">
            {cta}
          </button>
          <button
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle menu"
            className="flex size-9 items-center justify-center rounded-lg text-foreground/70 transition hover:bg-foreground/10 md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid overflow-hidden border-foreground/10 transition-all duration-300 md:hidden",
          open ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]"
        )}
      >
        <nav className="min-h-0">
          <div className="flex flex-col gap-1 px-6 py-3">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-lg px-2 py-2 text-sm text-foreground/70 transition hover:bg-foreground/5 hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
