import { Zap } from "lucide-react"
import { SpotlightCard } from "@/registry/components/spotlight-card"

export default function DemoSpotlightCard() {
  return (
    <div className="flex min-h-[320px] items-center justify-center p-8">
      <SpotlightCard className="max-w-sm">
        <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 text-foreground">
          <Zap className="size-5" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Instant previews</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/50">
          Move your cursor across the card — the spotlight follows, powered by a single radial
          gradient and no extra dependencies.
        </p>
      </SpotlightCard>
    </div>
  )
}
