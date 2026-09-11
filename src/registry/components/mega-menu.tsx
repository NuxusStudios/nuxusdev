"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface MegaSection {
  label: string
  items: { title: string; description: string; icon?: React.ReactNode }[]
}

/** Navigation with a full-width panel that opens on hover or focus. */
export function MegaMenu({ sections }: { sections: MegaSection[] }) {
  const [open, setOpen] = React.useState<string | null>(null)

  return (
    <div
      className="relative"
      onMouseLeave={() => setOpen(null)}
    >
      <nav className="flex items-center gap-1 border-b border-white/10 px-6 py-3">
        {sections.map((section) => (
          <button
            key={section.label}
            onMouseEnter={() => setOpen(section.label)}
            onFocus={() => setOpen(section.label)}
            aria-expanded={open === section.label}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors",
              open === section.label ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
            )}
          >
            {section.label}
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-200",
                open === section.label && "rotate-180"
              )}
            />
          </button>
        ))}
      </nav>

      <div
        className={cn(
          "absolute inset-x-0 top-full z-20 grid overflow-hidden transition-all duration-200",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="min-h-0">
          <div className="border-b border-white/10 bg-[#0c0c10]/95 p-6 backdrop-blur-xl">
            <div className="mx-auto grid max-w-4xl gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {sections
                .find((section) => section.label === open)
                ?.items.map((item) => (
                  <a
                    key={item.title}
                    href="#"
                    className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
                  >
                    {item.icon && (
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70">
                        {item.icon}
                      </span>
                    )}
                    <span>
                      <span className="block text-sm font-medium text-white">{item.title}</span>
                      <span className="mt-0.5 block text-[13px] leading-relaxed text-white/45">
                        {item.description}
                      </span>
                    </span>
                  </a>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
