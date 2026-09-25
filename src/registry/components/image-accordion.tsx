"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface AccordionPanel {
  id: string
  title: string
  blurb: string
  src: string
}

function shot(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=900&h=1200&fit=crop&q=75&auto=format`
}

export const ACCORDION_PANELS: AccordionPanel[] = [
  { id: "studio", title: "Studio", blurb: "Where the work starts", src: shot("1497366216548-37526070297c") },
  { id: "field", title: "Field", blurb: "Out where it gets used", src: shot("1470071459604-3b5ec3a7fe05") },
  { id: "press", title: "Press", blurb: "The bit that leaves a mark", src: shot("1519681393784-d120267933ba") },
  { id: "archive", title: "Archive", blurb: "Everything we kept", src: shot("1505765050516-f72dcac9c60e") },
  { id: "next", title: "Next", blurb: "Still being argued about", src: shot("1441974231531-c6227db76b6e") },
]

/**
 * Panels that give up their width to whichever one you are looking at.
 *
 * Expansion is `flex-grow`, not a measured width. Widths would have to be
 * recomputed for every breakpoint, every panel count and every container the
 * thing is dropped into; flex already knows the answer and transitions it.
 *
 * Both hover and focus open a panel, and the open one is real state rather than
 * a `:hover` rule, because a keyboard user tabbing through has no pointer and
 * would otherwise walk into captions they cannot read.
 *
 * Below the small breakpoint the row becomes a column and the same grow
 * mechanism opens panels vertically, so nothing has to be re-taught.
 */
export function ImageAccordion({
  panels = ACCORDION_PANELS,
  defaultIndex = 0,
  className,
}: {
  panels?: AccordionPanel[]
  defaultIndex?: number
  className?: string
}) {
  const [open, setOpen] = React.useState(defaultIndex)

  return (
    <section className={cn("w-full bg-background px-4 py-20 text-foreground md:px-6", className)}>
      <div
        className="mx-auto flex h-[34rem] max-w-5xl flex-col gap-2 sm:flex-row"
        onMouseLeave={() => setOpen(defaultIndex)}
      >
        {panels.map((panel, i) => (
          <button
            key={panel.id}
            type="button"
            aria-expanded={i === open}
            onMouseEnter={() => setOpen(i)}
            onFocus={() => setOpen(i)}
            onClick={() => setOpen(i)}
            style={{ flexGrow: i === open ? 4.2 : 1 }}
            className={cn(
              "group/panel relative isolate min-h-0 min-w-0 flex-1 basis-0 overflow-hidden rounded-xl",
              "border border-border text-left",
              "transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background",
              "motion-reduce:transition-none",
            )}
          >
            <img
              src={panel.src}
              alt=""
              loading="lazy"
              draggable={false}
              className={cn(
                "absolute inset-0 size-full object-cover transition-[filter,transform] duration-700",
                i === open ? "scale-100 saturate-100" : "scale-105 saturate-[0.35]",
              )}
            />
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                "bg-gradient-to-t from-background via-background/40 to-transparent",
                i === open ? "opacity-85" : "opacity-95",
              )}
            />

            <span className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5">
              {/*
                The title stays upright in the open panel and turns on its side
                in the closed ones, which is the only way a word fits in a
                column a few characters wide.
              */}
              <span
                className={cn(
                  "origin-bottom-left whitespace-nowrap text-base font-semibold tracking-tight transition-transform duration-700",
                  i === open ? "translate-y-0 rotate-0" : "sm:-rotate-90 sm:translate-x-1 sm:-translate-y-1",
                )}
              >
                {panel.title}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-[0.78rem] text-muted-foreground transition-opacity duration-500",
                  i === open ? "opacity-100" : "opacity-0",
                )}
              >
                {panel.blurb}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
