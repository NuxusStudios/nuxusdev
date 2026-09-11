import { Timeline } from "@/registry/components/timeline"

const entries = [
  { title: "Component published", date: "Mar 04", description: "Shimmer Button went live with a demo and MIT license.", status: "done" as const },
  { title: "Reached 1,000 installs", date: "Mar 18", description: "Picked up by three design systems in the same week.", status: "done" as const },
  { title: "Featured on the homepage", date: "Apr 02", description: "Editors' pick in the Buttons category.", status: "current" as const },
  { title: "v2 with variants", date: "Soon", description: "Adds size variants and a reduced-motion fallback.", status: "upcoming" as const },
]

export default function DemoTimeline() {
  return <Timeline entries={entries} />
}
