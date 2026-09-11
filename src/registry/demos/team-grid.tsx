import { TeamGrid } from "@/registry/components/team-grid"

const members = [
  { name: "Nova Reyes", role: "Design engineering", color: "#7c5cff", links: [{ label: "X", href: "#" }, { label: "Site", href: "#" }] },
  { name: "Kaito Mori", role: "Agent interfaces", color: "#00c2a8", links: [{ label: "GitHub", href: "#" }] },
  { name: "Amara Osei", role: "Data visualisation", color: "#f59e0b", links: [{ label: "X", href: "#" }] },
  { name: "Juno Park", role: "Graphics & shaders", color: "#3b82f6", links: [{ label: "Site", href: "#" }] },
]

export default function DemoTeamGrid() {
  return (
    <TeamGrid
      members={members}
      description="Four people, one registry, an unreasonable number of opinions about focus states."
    />
  )
}
