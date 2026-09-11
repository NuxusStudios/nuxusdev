import { StatsSection } from "@/registry/components/stats-section"

const stats = [
  { value: 12000, suffix: "+", label: "Components published" },
  { value: 3589155, label: "Builders served" },
  { value: 99.98, suffix: "%", decimals: 2, label: "Registry uptime" },
  { value: 25431, label: "Installs this week" },
]

export default function DemoStatsSection() {
  return <StatsSection stats={stats} title="Numbers that keep going up" />
}
