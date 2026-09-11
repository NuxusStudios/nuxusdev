"use client"

import { DataTable, type Column } from "@/registry/components/data-table"

type Payment = { invoice: string; customer: string; status: string; amount: number }

const rows: Payment[] = [
  { invoice: "INV-1042", customer: "Northwind", status: "Paid", amount: 2400 },
  { invoice: "INV-1043", customer: "Cadence Labs", status: "Pending", amount: 1200 },
  { invoice: "INV-1044", customer: "Trailhead", status: "Paid", amount: 860 },
  { invoice: "INV-1045", customer: "Helio", status: "Failed", amount: 4300 },
  { invoice: "INV-1046", customer: "Meridian", status: "Paid", amount: 1750 },
]

const columns: Column<Payment>[] = [
  { key: "invoice", header: "Invoice" },
  { key: "customer", header: "Customer" },
  {
    key: "status",
    header: "Status",
    render: (r) => (
      <span
        className={
          r.status === "Paid"
            ? "rounded-full bg-emerald-500/12 px-2 py-0.5 text-xs text-emerald-300"
            : r.status === "Pending"
              ? "rounded-full bg-amber-500/12 px-2 py-0.5 text-xs text-amber-300"
              : "rounded-full bg-rose-500/12 px-2 py-0.5 text-xs text-rose-300"
        }
      >
        {r.status}
      </span>
    ),
  },
  { key: "amount", header: "Amount", align: "right", render: (r) => `$${r.amount.toLocaleString()}` },
]

export default function DemoDataTable() {
  return (
    <div className="p-8">
      <DataTable columns={columns} rows={rows} searchKey="customer" />
    </div>
  )
}
