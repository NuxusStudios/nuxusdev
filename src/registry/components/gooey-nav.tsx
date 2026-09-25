"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface GooeyItem {
  id: string
  label: string
}

export const GOOEY_ITEMS: GooeyItem[] = [
  { id: "components", label: "Components" },
  { id: "themes", label: "Themes" },
  { id: "templates", label: "Templates" },
  { id: "pricing", label: "Pricing" },
]

/**
 * A nav whose indicator melts from one item to the next.
 *
 * Two shapes ride behind the labels: the pill, which moves at one speed, and a
 * droplet that lags. On their own they would just be two rectangles chasing
 * each other — the SVG filter is what fuses them, blurring the layer and then
 * pushing alpha back to hard edges so anything that overlaps reads as one
 * surface that stretches and snaps.
 *
 * The labels are deliberately outside the filtered layer. A filter applies to
 * everything it contains, and blurring text to a threshold turns it to mud.
 *
 * Geometry is written to CSS custom properties on the two shapes rather than
 * held in state: the active item's offset and width are numbers React never
 * renders, and keeping them out of state keeps a resize from re-rendering
 * every label.
 */
export function GooeyNav({
  items = GOOEY_ITEMS,
  defaultId,
  onSelect,
  className,
}: {
  items?: GooeyItem[]
  defaultId?: string
  onSelect?: (id: string) => void
  className?: string
}) {
  const [active, setActive] = React.useState(defaultId ?? items[0]?.id ?? "")
  const listRef = React.useRef<HTMLDivElement>(null)
  const pillRef = React.useRef<HTMLSpanElement>(null)
  const dropRef = React.useRef<HTMLSpanElement>(null)
  const filterId = React.useId().replace(/:/g, "")

  React.useEffect(() => {
    const list = listRef.current
    const pill = pillRef.current
    const drop = dropRef.current
    if (!list || !pill || !drop) return

    const place = () => {
      const target = list.querySelector<HTMLElement>(`[data-id="${CSS.escape(active)}"]`)
      if (!target) return
      // Offset within the list, so a scrolled or shifted page changes nothing.
      const x = target.offsetLeft
      const w = target.offsetWidth
      for (const node of [pill, drop]) {
        node.style.setProperty("--x", `${x}px`)
        node.style.setProperty("--w", `${w}px`)
      }
    }

    place()
    // Fonts landing late change every label's width, so remeasure on resize.
    const observer = new ResizeObserver(place)
    observer.observe(list)
    return () => observer.disconnect()
  }, [active, items])

  return (
    <nav className={cn("flex w-full items-center justify-center bg-background px-4 py-16 sm:px-6", className)}>
      {/*
        The filter itself: blur everything in the layer, then run alpha through
        a steep ramp so mid-tones vanish and only the merged silhouette is left.
      */}
      <svg aria-hidden className="pointer-events-none absolute size-0">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="soft" />
            <feColorMatrix
              in="soft"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -11"
            />
          </filter>
        </defs>
      </svg>

      {/*
        A scroller rather than a wrap: the indicator only travels horizontally,
        so a nav that wrapped to two lines would leave it pointing at the wrong
        row. `mx-auto` on a `w-max` child centres it while it fits and gives up
        gracefully when it does not. The vertical padding is room for the
        filter's blur, which the scroll container would otherwise clip.
      */}
      <div className="max-w-full overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div
          ref={listRef}
          className="relative mx-auto flex w-max items-center gap-1 rounded-full border border-border bg-card p-1.5"
        >
          <span
            aria-hidden
            style={{ filter: `url(#${filterId})` }}
            className="pointer-events-none absolute inset-1.5"
          >
            <span
              ref={pillRef}
              className={cn(
                "absolute left-0 top-0 h-full rounded-full bg-primary",
                "[--x:0px] [--w:0px] [width:var(--w)] [transform:translateX(var(--x))]",
                "transition-[transform,width] duration-[450ms] ease-[cubic-bezier(0.34,1.4,0.64,1)]",
                "motion-reduce:transition-none",
              )}
            />
            {/*
              The straggler. Slower and shorter, so the pair pulls into a neck
              on the way across. Its centring is written into the transform and
              not with `-translate-y-1/2`, which Tailwind puts on the separate
              `translate` property — the two would stack and lift it clean off
              the pill.
            */}
            <span
              ref={dropRef}
              className={cn(
                "absolute left-0 top-1/2 h-2/3 rounded-full bg-primary",
                "[--x:0px] [--w:0px] [width:var(--w)] [transform:translateY(-50%)_translateX(var(--x))]",
                "transition-[transform,width] duration-[750ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                "motion-reduce:transition-none",
              )}
            />
          </span>

          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              data-id={item.id}
              aria-current={item.id === active ? "page" : undefined}
              onClick={() => {
                setActive(item.id)
                onSelect?.(item.id)
              }}
              className={cn(
                "relative z-10 whitespace-nowrap rounded-full px-3 py-2 text-[0.8rem] font-medium transition-colors duration-300 sm:px-4 sm:text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                item.id === active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
