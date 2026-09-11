import { Boxes, Code2, Cpu, Gauge, Lock, Workflow } from "lucide-react"
import { MegaMenu } from "@/registry/components/mega-menu"

const sections = [
  {
    label: "Product",
    items: [
      { title: "Components", description: "160 live React components.", icon: <Boxes className="size-4" /> },
      { title: "Workflows", description: "Chain steps and branch on output.", icon: <Workflow className="size-4" /> },
      { title: "Performance", description: "First paint under 200ms.", icon: <Gauge className="size-4" /> },
    ],
  },
  {
    label: "Developers",
    items: [
      { title: "API reference", description: "Every endpoint, with examples.", icon: <Code2 className="size-4" /> },
      { title: "Runtime", description: "Deploy to the edge in one command.", icon: <Cpu className="size-4" /> },
      { title: "Security", description: "SOC 2, SSO and audit logs.", icon: <Lock className="size-4" /> },
    ],
  },
  { label: "Pricing", items: [{ title: "Plans", description: "From free to enterprise." }] },
]

export default function DemoMegaMenu() {
  return (
    <div className="min-h-[420px] bg-zinc-950">
      <MegaMenu sections={sections} />
      <p className="p-8 text-sm text-white/35">Hover a nav item to open its panel.</p>
    </div>
  )
}
