"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Logo } from "@/components/site/logo"
import { TAGS, tagHref } from "@/lib/data/tags"
import { cn, formatNumber } from "@/lib/utils"

const PRIMARY = [
  { label: "Featured", href: "/community/components/featured" },
  { label: "Newest", href: "/community/components/newest" },
  { label: "Authors", href: "/community/authors" },
  { label: "Libraries", href: "/community/libraries" },
  { label: "Updated", href: "/community/components/updated" },
]

export function MobileCategoryNav() {
  const pathname = usePathname()
  // storing the route the drawer was opened on closes it on navigation for free
  const [openedOn, setOpenedOn] = React.useState<string | null>(null)
  const open = openedOn === pathname

  const setOpen = React.useCallback(
    (next: boolean) => setOpenedOn(next ? pathname : null),
    [pathname]
  )

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open categories"
        className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[290px] flex-col border-r border-border bg-background">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                aria-label="Close categories"
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="mb-5 space-y-0.5">
                {PRIMARY.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "block rounded-lg px-2.5 py-2 text-sm transition-colors",
                        pathname === item.href
                          ? "bg-accent font-medium text-foreground"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {(["marketing", "ui"] as const).map((group) => (
                <div key={group} className="mb-5">
                  <h3 className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
                    {group === "marketing" ? "Marketing Blocks" : "UI Components"}
                  </h3>
                  <ul className="space-y-0.5">
                    {TAGS.filter((t) => t.group === group).map((tag) => (
                      <li key={tag.slug}>
                        <Link
                          href={tagHref(tag)}
                          className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                        >
                          <span className="truncate">{tag.name}</span>
                          {tag.badge === "new" ? (
                            <span className="shrink-0 rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[10px] text-emerald-400">
                              New
                            </span>
                          ) : (
                            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/50">
                              {formatNumber(tag.count)}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
