import { Cpu, Gauge, ShieldCheck } from "lucide-react"
import { GlowCard } from "@/registry/components/glow-card"

const cards = [
  { icon: <Gauge className="size-5" />, title: "Fast by default", body: "Every component ships without a runtime dependency it doesn't need." },
  { icon: <ShieldCheck className="size-5" />, title: "Accessible", body: "Focus states, roles and contrast are part of the review, not an afterthought." },
  { icon: <Cpu className="size-5" />, title: "Agent ready", body: "The same source is available as a prompt for whichever tool you use." },
]

export default function DemoGlowCard() {
  return (
    <div className="grid gap-4 p-8 md:grid-cols-3">
      {cards.map((c) => (
        <GlowCard key={c.title}>
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 text-foreground/70">
            {c.icon}
          </div>
          <h3 className="text-[15px] font-semibold text-foreground">{c.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/45">{c.body}</p>
        </GlowCard>
      ))}
    </div>
  )
}
