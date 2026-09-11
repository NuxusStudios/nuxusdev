import { NumberTicker } from "@/registry/components/number-ticker"

export default function DemoNumberTicker() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-2">
      <NumberTicker value={12400} className="text-6xl font-semibold" />
      <p className="text-sm text-foreground/40">builders shipping this week</p>
    </div>
  )
}
