import { Boxes, FileText, Palette, Settings, User } from "lucide-react"
import { CommandPalette } from "@/registry/components/command-palette"

const items = [
  { group: "Navigation", label: "Go to components", icon: <Boxes className="size-4" />, hint: "G then C" },
  { group: "Navigation", label: "Go to templates", icon: <FileText className="size-4" />, hint: "G then T" },
  { group: "Navigation", label: "Go to themes", icon: <Palette className="size-4" /> },
  { group: "Account", label: "View profile", icon: <User className="size-4" /> },
  { group: "Account", label: "Settings", icon: <Settings className="size-4" />, hint: "⌘," },
]

export default function DemoCommandPalette() {
  return (
    <div className="flex min-h-[380px] items-start justify-center bg-[radial-gradient(100%_80%_at_50%_0%,#111827,#020617)] p-10">
      <CommandPalette items={items} />
    </div>
  )
}
