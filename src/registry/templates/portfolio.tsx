"use client"

import { ArrowUpRight } from "lucide-react"
import { TiltCard } from "@/registry/components/tilt-card"
import { Marquee } from "@/registry/components/marquee"
import { StatsSection } from "@/registry/components/stats-section"

const work = [
  { name: "Northwind", kind: "Brand + site", year: "2026" },
  { name: "Cadence Labs", kind: "Product design", year: "2025" },
  { name: "Helio", kind: "Design system", year: "2025" },
  { name: "Trailhead", kind: "Marketing site", year: "2024" },
]

const stats = [
  { value: 48, suffix: "+", label: "Projects shipped" },
  { value: 12, label: "Years designing" },
  { value: 4, label: "Awwwards" },
  { value: 100, suffix: "%", label: "Referral rate" },
]

export default function PortfolioTemplate() {
  return (
    <div className="bg-[#0a0a0a]">
      <section className="mx-auto max-w-4xl px-6 pt-24">
        <p className="text-sm text-white/40">Ada Mercer — design engineer, Lisbon</p>
        <h1 className="mt-6 text-[3.5rem] font-semibold leading-[0.95] tracking-[-0.04em] text-white md:text-[5rem]">
          I design things
          <br />
          <span className="text-white/35">and then build them</span>
        </h1>
        <p className="mt-8 max-w-lg text-[17px] leading-relaxed text-white/50">
          Fifteen years between Figma and a terminal. Currently taking on two projects a quarter,
          mostly design systems and the marketing sites that sit on top of them.
        </p>
        <div className="mt-9 flex gap-3">
          <button className="h-11 rounded-full bg-white px-6 text-sm font-medium text-black">Start a project</button>
          <button className="h-11 rounded-full border border-white/15 px-6 text-sm font-medium text-white">Read the CV</button>
        </div>
      </section>

      <section className="mt-20 border-y border-white/10 py-6">
        <Marquee pauseOnHover className="[--duration:30s]">
          {["Figma", "React", "Motion", "WebGL", "Tailwind", "Swift", "Rive", "Blender"].map((s) => (
            <span key={s} className="px-8 text-lg font-medium text-white/25">{s}</span>
          ))}
        </Marquee>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-sm uppercase tracking-[0.16em] text-white/35">Selected work</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {work.map((item) => (
            <TiltCard key={item.name} maxTilt={6}>
              <div className="flex h-44 flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="text-[13px] text-white/40">{item.year}</span>
                  <ArrowUpRight className="size-4 text-white/30" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-white">{item.name}</p>
                  <p className="mt-1 text-[13px] text-white/45">{item.kind}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      <StatsSection stats={stats} />
    </div>
  )
}
