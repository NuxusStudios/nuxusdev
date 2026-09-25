import { ArrowRight } from "lucide-react"
import { TrailCursor } from "@/registry/components/trail-cursor"

export default function DemoTrailCursor() {
  return (
    <TrailCursor className="flex min-h-[34rem] flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Move your pointer
      </p>
      <h1 className="max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        The ring catches up, then holds on
      </h1>
      <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        Hover anything you can click and the ring wraps it, borrowing the corner radius as it goes.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <a
          href="#"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Browse the registry
          <ArrowRight className="size-4" />
        </a>
        <button
          type="button"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground"
        >
          Read the docs
        </button>
        <span
          data-cursor
          className="rounded-md border border-dashed border-border px-4 py-2 text-sm text-muted-foreground"
        >
          Or anything marked up for it
        </span>
      </div>
    </TrailCursor>
  )
}
