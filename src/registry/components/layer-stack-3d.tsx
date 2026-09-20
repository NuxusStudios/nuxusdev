"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface StackLayer {
  id: string
  name: string
  detail: string
  /** Rendered inside the slab. Keep it flat — it is drawn on a tilted plane. */
  content?: React.ReactNode
}

function Bars({ widths, tint }: { widths: number[]; tint?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-1.5">
      {widths.map((width, i) => (
        <span
          key={i}
          className={cn("block h-1.5 rounded-full", tint ? "bg-primary/60" : "bg-foreground/15")}
          style={{ width: `${width}%` }}
        />
      ))}
    </div>
  )
}

function Grid({ cells }: { cells: number }) {
  return (
    <div className="grid h-full w-full grid-cols-4 content-center gap-1.5">
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} className="aspect-square rounded-[4px] border border-border bg-background/60" />
      ))}
    </div>
  )
}

export const STACK_LAYERS: StackLayer[] = [
  { id: "ui", name: "Interface", detail: "The screen your users touch", content: <Grid cells={8} /> },
  { id: "state", name: "State", detail: "What the screen is showing right now", content: <Bars widths={[80, 55, 92]} tint /> },
  { id: "api", name: "API", detail: "The contract between the two halves", content: <Bars widths={[60, 88, 40]} /> },
  { id: "data", name: "Storage", detail: "Where it all ends up", content: <Grid cells={4} /> },
]

/**
 * An architecture diagram as a stack of slabs that pulls apart in space.
 *
 * The whole stack sits on one tilted plane and each slab is pushed along Z from
 * it, so the gaps stay parallel however far apart they go. Offsetting them in
 * Y instead would read as a list sliding down, not as depth.
 *
 * The separation is a single `--spread` on the container, which every slab
 * multiplies by its own index. One property animates and the whole stack fans
 * out together.
 */
export function LayerStack3D({
  layers = STACK_LAYERS,
  eyebrow = "Architecture",
  title = "Four layers, one paste",
  blurb = "Hover the stack to pull it apart.",
  className,
}: {
  layers?: StackLayer[]
  eyebrow?: string
  title?: string
  blurb?: string
  className?: string
}) {
  const [open, setOpen] = React.useState<number | null>(null)

  return (
    <section className={cn("w-full bg-background px-4 py-24 text-foreground md:px-6", className)}>
      <div className="mx-auto grid max-w-5xl items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <header>
          {eyebrow ? (
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          {blurb ? <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">{blurb}</p> : null}

          <ul className="mt-8 space-y-1">
            {layers.map((layer, i) => (
              <li key={layer.id}>
                <button
                  type="button"
                  onMouseEnter={() => setOpen(i)}
                  onFocus={() => setOpen(i)}
                  onMouseLeave={() => setOpen(null)}
                  onBlur={() => setOpen(null)}
                  className={cn(
                    "flex w-full items-baseline gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    open === i ? "bg-card" : "hover:bg-card/60",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[0.7rem] transition-colors",
                      open === i ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium">{layer.name}</span>
                  <span className="ml-auto hidden text-[0.72rem] text-muted-foreground sm:block">
                    {layer.detail}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </header>

        <div
          // Focusing or hovering a row in the list fans the stack too, so the
          // highlighted slab is not buried under the three above it.
          data-open={open === null ? undefined : ""}
          className="group/stack [perspective:1200px] [perspective-origin:50%_40%]"
          onMouseLeave={() => setOpen(null)}
        >
          <div
            aria-hidden
            className={cn(
              "relative mx-auto flex h-[26rem] w-full max-w-sm items-center justify-center",
              "[transform-style:preserve-3d]",
              // One tilt for the stack; slabs only ever move along its normal.
              "[transform:rotateX(58deg)_rotateZ(-40deg)]",
              // Resting gap is small; hovering anywhere fans the whole stack.
              "[--spread:22px] group-hover/stack:[--spread:82px] [[data-open]_&]:[--spread:82px]",
              "transition-[transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              "group-hover/stack:[transform:rotateX(52deg)_rotateZ(-36deg)]",
            )}
          >
            {layers.map((layer, i) => {
              // Top of the stack is index 0, so it lifts furthest.
              const rank = layers.length - 1 - i
              return (
                <div
                  key={layer.id}
                  style={{
                    transform: `translateZ(calc(var(--spread) * ${rank}))`,
                    transitionDelay: `${rank * 45}ms`,
                  }}
                  className={cn(
                    "absolute h-44 w-64 rounded-xl border border-border bg-card p-4",
                    "shadow-[0_18px_40px_-24px_rgb(0_0_0/0.8)]",
                    "transition-[transform,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    open === i && "border-primary/70 shadow-[0_24px_50px_-20px_var(--color-primary)]",
                  )}
                >
                  <div className="flex items-center justify-between pb-3">
                    <span className="text-[0.7rem] font-semibold tracking-tight">{layer.name}</span>
                    <span
                      className={cn(
                        "size-1.5 rounded-full transition-colors",
                        open === i ? "bg-primary" : "bg-foreground/20",
                      )}
                    />
                  </div>
                  <div className="h-[6.5rem]">{layer.content}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
