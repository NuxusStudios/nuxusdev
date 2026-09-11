import { Calendar, Camera, Folder, Mail, Music, Settings, Terminal } from "lucide-react"
import { MacosDock } from "@/registry/components/macos-dock"

export default function DemoMacosDock() {
  const items = [
    { label: "Finder", icon: <Folder className="size-5" /> },
    { label: "Mail", icon: <Mail className="size-5" /> },
    { label: "Calendar", icon: <Calendar className="size-5" /> },
    { label: "Music", icon: <Music className="size-5" /> },
    { label: "Camera", icon: <Camera className="size-5" /> },
    { label: "Terminal", icon: <Terminal className="size-5" /> },
    { label: "Settings", icon: <Settings className="size-5" /> },
  ]
  return (
    <div className="flex min-h-[300px] items-end justify-center bg-[linear-gradient(180deg,#0b1220,#020617)] p-10">
      <MacosDock items={items} />
    </div>
  )
}
