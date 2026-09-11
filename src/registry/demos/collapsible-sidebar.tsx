"use client"

import { BarChart3, Boxes, Inbox, LayoutGrid, Settings, Users } from "lucide-react"
import { CollapsibleSidebar } from "@/registry/components/collapsible-sidebar"

export default function DemoCollapsibleSidebar() {
  return (
    <div className="flex h-[420px] bg-zinc-950">
      <CollapsibleSidebar
        brand="Northwind"
        items={[
          { label: "Overview", icon: LayoutGrid, active: true },
          { label: "Inbox", icon: Inbox, badge: 12 },
          { label: "Components", icon: Boxes, badge: 36 },
          { label: "Customers", icon: Users },
          { label: "Analytics", icon: BarChart3 },
          { label: "Settings", icon: Settings },
        ]}
        footer={
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[11.5px] text-white/50">
            2 of 5 seats used
          </div>
        }
      />
      <div className="flex flex-1 items-center justify-center text-sm text-white/25">
        Collapse the sidebar →
      </div>
    </div>
  )
}
