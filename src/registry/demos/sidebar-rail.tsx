import { Bell, Folder, Home, LifeBuoy, Search, Settings, Users } from "lucide-react"
import { SidebarRail } from "@/registry/components/sidebar-rail"

const items = [
  { id: "home", label: "Home", icon: <Home className="size-5" /> },
  { id: "search", label: "Search", icon: <Search className="size-5" /> },
  { id: "files", label: "Files", icon: <Folder className="size-5" /> },
  { id: "team", label: "Team", icon: <Users className="size-5" /> },
  { id: "alerts", label: "Notifications", icon: <Bell className="size-5" />, badge: 12 },
]

const footer = [
  { id: "help", label: "Help", icon: <LifeBuoy className="size-5" /> },
  { id: "settings", label: "Settings", icon: <Settings className="size-5" /> },
]

export default function DemoSidebarRail() {
  return (
    <div className="flex h-[400px] bg-background">
      <SidebarRail items={items} footer={footer} />
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-foreground/35">Hover an icon for its label.</p>
      </div>
    </div>
  )
}
