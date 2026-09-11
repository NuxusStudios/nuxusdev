import { AvatarStack } from "@/registry/components/avatar-stack"

const users = [
  { name: "Nova Reyes", color: "#7c5cff" },
  { name: "Kaito Mori", color: "#00c2a8" },
  { name: "Amara Osei", color: "#f59e0b" },
  { name: "Sable Quinn", color: "#ec4899" },
  { name: "Juno Park", color: "#3b82f6" },
  { name: "Rin Takahashi", color: "#22c55e" },
  { name: "Mira Delgado", color: "#ef4444" },
]

export default function DemoAvatarStack() {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3">
      <AvatarStack users={users} />
      <p className="text-sm text-white/40">7 people are editing this file</p>
    </div>
  )
}
