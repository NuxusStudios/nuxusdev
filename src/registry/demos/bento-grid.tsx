import { Bell, Calendar, FileText, Globe, Search } from "lucide-react"
import { BentoCard, BentoGrid } from "@/registry/components/bento-grid"

const features = [
  { name: "Save your files", description: "We automatically save your files as you type.", icon: <FileText className="size-4" />, className: "col-span-3 lg:col-span-2" },
  { name: "Full text search", description: "Search through all your files in one place.", icon: <Search className="size-4" />, className: "col-span-3 lg:col-span-1" },
  { name: "Multilingual", description: "Supports 100+ languages and counting.", icon: <Globe className="size-4" />, className: "col-span-3 lg:col-span-1" },
  { name: "Calendar", description: "Use the calendar to filter your files by date.", icon: <Calendar className="size-4" />, className: "col-span-3 lg:col-span-1" },
  { name: "Notifications", description: "Get notified when someone shares a file.", icon: <Bell className="size-4" />, className: "col-span-3 lg:col-span-1" },
]

export default function DemoBentoGrid() {
  return (
    <div className="p-6">
      <BentoGrid>
        {features.map((f) => (
          <BentoCard key={f.name} {...f} />
        ))}
      </BentoGrid>
    </div>
  )
}
