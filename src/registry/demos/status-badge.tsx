import { StatusBadge } from "@/registry/components/status-badge"

export default function DemoStatusBadge() {
  return (
    <div className="flex min-h-[200px] flex-wrap items-center justify-center gap-3 p-8">
      <StatusBadge tone="operational" />
      <StatusBadge tone="degraded" />
      <StatusBadge tone="down" label="Incident" />
      <StatusBadge tone="maintenance" />
      <StatusBadge tone="beta" pulse={false} />
    </div>
  )
}
