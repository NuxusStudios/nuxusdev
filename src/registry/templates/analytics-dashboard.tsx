"use client"

import { Bell, LayoutGrid, LineChart, Search, Settings, Users } from "lucide-react"
import { KpiCard } from "@/registry/components/kpi-card"
import { DataTable, type Column } from "@/registry/components/data-table"
import { AvatarStack } from "@/registry/components/avatar-stack"
import { StatusBadge } from "@/registry/components/status-badge"
import { ProgressRing } from "@/registry/components/progress-ring"

type Row = { customer: string; plan: string; mrr: number; status: string }

const rows: Row[] = [
  { customer: "Northwind", plan: "Team", mrr: 2400, status: "Active" },
  { customer: "Cadence Labs", plan: "Pro", mrr: 1200, status: "Trial" },
  { customer: "Trailhead", plan: "Pro", mrr: 860, status: "Active" },
  { customer: "Helio", plan: "Team", mrr: 4300, status: "Past due" },
  { customer: "Vireo", plan: "Builder", mrr: 180, status: "Active" },
]

const columns: Column<Row>[] = [
  { key: "customer", header: "Customer" },
  { key: "plan", header: "Plan" },
  { key: "status", header: "Status" },
  { key: "mrr", header: "MRR", align: "right", render: (r) => `$${r.mrr.toLocaleString()}` },
]

const NAV = [
  { label: "Overview", icon: <LayoutGrid className="size-4" />, active: true },
  { label: "Analytics", icon: <LineChart className="size-4" /> },
  { label: "Customers", icon: <Users className="size-4" /> },
  { label: "Settings", icon: <Settings className="size-4" /> },
]

export default function AnalyticsDashboardTemplate() {
  return (
    <div className="flex min-h-[820px] bg-zinc-950 text-white">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 p-4 md:flex">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-white text-sm font-bold text-black">N</span>
          <span className="text-sm font-semibold">Northwind</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <button
              key={item.label}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${
                item.active ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs text-white/50">Credits used</p>
          <div className="mt-2 flex justify-center">
            <ProgressRing value={62} size={84} strokeWidth={6} label="of 2K" />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex h-14 items-center gap-4 border-b border-white/10 px-5">
          <div className="flex h-8 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-[13px] text-white/35">
            <Search className="size-3.5" /> Search customers…
          </div>
          <StatusBadge tone="operational" />
          <Bell className="size-4 text-white/40" />
          <AvatarStack
            size={26}
            users={[
              { name: "Nova Reyes", color: "#7c5cff" },
              { name: "Kaito Mori", color: "#00c2a8" },
              { name: "Amara Osei", color: "#f59e0b" },
            ]}
          />
        </header>

        <div className="p-5">
          <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
          <p className="mt-1 text-sm text-white/45">Last 30 days across all workspaces.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <KpiCard label="Monthly recurring revenue" value="$48,290" change={12.4} hint="vs. last month" series={[12, 18, 15, 24, 22, 30, 36, 34, 42]} />
            <KpiCard label="Active customers" value="1,284" change={3.2} hint="vs. last month" series={[30, 28, 34, 33, 40, 44, 42, 49, 52]} />
            <KpiCard label="Churn" value="1.8%" change={-0.6} hint="vs. last month" series={[9, 8.4, 8.8, 7.6, 7.1, 6.4, 5.9, 5.4, 4.8]} />
          </div>

          <div className="mt-6">
            <DataTable columns={columns} rows={rows} searchKey="customer" />
          </div>
        </div>
      </main>
    </div>
  )
}
