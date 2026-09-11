import { KpiCard } from "@/registry/components/kpi-card"

export default function DemoKpiCard() {
  return (
    <div className="grid gap-4 p-8 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard label="Monthly recurring revenue" value="$48,290" change={12.4} hint="vs. last month" series={[12, 18, 15, 24, 22, 30, 36, 34, 42]} />
      <KpiCard label="Active installs" value="25,431" change={4.1} hint="last 7 days" series={[30, 28, 34, 33, 40, 44, 42, 49, 52]} />
      <KpiCard label="Churn" value="1.8%" change={-0.6} hint="vs. last month" series={[9, 8.4, 8.8, 7.6, 7.1, 6.4, 5.9, 5.4, 4.8]} />
    </div>
  )
}
