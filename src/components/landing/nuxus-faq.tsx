"use client"

import * as React from "react"
import { Plus } from "lucide-react"
import { SectionLabel } from "@/components/landing/component-wall"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    q: `What is ${BRAND.name}?`,
    a: `A registry of React components you can watch run before you take them. Every component has a live preview, its real source, and a generated prompt for whichever AI tool you build in.`,
  },
  {
    q: "Do I need an account?",
    a: "No. Browsing, previewing, reading source and copying code are all free and open. An account only exists so you can bookmark components into lists and publish your own.",
  },
  {
    q: "How is this different from installing a component library?",
    a: "You don't install a package or inherit its upgrade path. The source lands in your repo as files you own and edit, following shadcn/ui conventions so it picks up your existing theme.",
  },
  {
    q: "What does the prompt actually contain?",
    a: "The component source, its demo, the install command for any dependencies, and the rules an agent needs to place the files correctly and adapt colours to your tokens. There's one prompt per component and it works in any coding agent — you never pick a tool first. It's generated from the same source the preview renders, so it can't drift.",
  },
  {
    q: "Where do the components come from?",
    a: `Some are written for ${BRAND.name}. The rest are imported from open-source registries that publish under MIT, with author, license and source URL carried through. Nothing is taken from a paywalled catalogue.`,
  },
  {
    q: "Can I publish my own?",
    a: "Yes. Publish a component with a demo, pick categories and a license, and it appears under your handle with a live preview and a prompt generated automatically.",
  },
]

export function NuxusFaq() {
  const [open, setOpen] = React.useState<number | null>(0)

  return (
    <section className="border-t border-border py-24">
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="max-w-sm">
          <SectionLabel>Questions</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-[2.5rem] md:leading-[1.08]">
            The short answers
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Everything else lives in the docs — or ask us directly.
          </p>
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
                    <p className="pb-5 pr-8 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
