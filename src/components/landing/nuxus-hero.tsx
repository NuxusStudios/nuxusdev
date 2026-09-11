import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import { HeroCanvas } from "@/components/landing/hero-canvas"
import { SiteHeader } from "@/components/site/site-header"
import { BRAND } from "@/lib/brand"
import { formatNumber } from "@/lib/utils"

export function NuxusHero({
  componentCount,
  libraryCount,
  authorCount,
}: {
  componentCount: number
  libraryCount: number
  authorCount: number
}) {
  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <HeroCanvas />
      </div>

      {/* fade the canvas into the page so the next section doesn't cut hard */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-b from-transparent to-background"
      />

      <div className="relative z-10">
        <SiteHeader transparent />
      </div>

      <div className="container-page relative z-10 flex flex-col items-center pb-28 pt-24 text-center md:pt-32">
        <div className="hero-rise">
          <Link
            href="/community/components/newest"
            className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1 pl-1 pr-3 text-[13px] text-white/70 backdrop-blur-md transition-colors hover:border-white/30 hover:text-white"
          >
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-black">
              New
            </span>
            {formatNumber(componentCount)} components, every one live
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <h1
          style={{ "--rise-delay": "0.06s" } as React.CSSProperties}
          className="hero-rise mt-8 max-w-4xl text-[3.4rem] font-semibold leading-[0.94] tracking-[-0.045em] text-white md:text-[6.5rem]"
        >
          Interfaces that
          <br />
          <KineticWord>already move</KineticWord>
        </h1>

        <p
          style={{ "--rise-delay": "0.14s" } as React.CSSProperties}
          className="hero-rise mt-8 max-w-xl text-balance text-[17px] leading-relaxed text-white/60"
        >
          {BRAND.description}
        </p>

        <div
          style={{ "--rise-delay": "0.22s" } as React.CSSProperties}
          className="hero-rise mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            href="/community/components/featured"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-[15px] font-medium text-black transition-transform hover:scale-[1.02] active:scale-100"
          >
            Browse the registry
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/publish"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-7 text-[15px] font-medium text-white backdrop-blur-md transition-colors hover:border-white/40 hover:bg-white/[0.09]"
          >
            <Play className="size-3.5 fill-current" />
            Publish yours
          </Link>
        </div>

        <dl
          style={{ "--rise-delay": "0.34s" } as React.CSSProperties}
          className="hero-rise mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-left"
        >
          <Stat value={formatNumber(componentCount)} label="live components" />
          <Divider />
          <Stat value={String(libraryCount)} label="libraries" />
          <Divider />
          <Stat value={String(authorCount)} label="authors" />
          <Divider />
          <Stat value="MIT" label="licensed throughout" />
        </dl>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xl font-semibold tabular-nums text-white">{value}</dt>
      <dd className="text-[13px] text-white/45">{label}</dd>
    </div>
  )
}

function Divider() {
  return <span aria-hidden className="hidden h-8 w-px bg-white/15 sm:block" />
}

/** the payoff word, with a light sweep that reads as motion without shouting */
function KineticWord({ children }: { children: string }) {
  return (
    <span className="relative inline-block">
      <span className="nuxus-sweep bg-clip-text text-transparent">{children}</span>
    </span>
  )
}
