import { FeatureSteps } from "@/registry/components/feature-steps"

const steps = [
  { title: "Find a component", description: "Browse live previews instead of screenshots." },
  { title: "Copy the prompt", description: "One click puts the whole thing on your clipboard." },
  { title: "Paste it anywhere", description: "Claude Code, Codex, Cursor, Lovable — all land the same file." },
  { title: "Ship it", description: "The source is yours, in your repo, matching your theme." },
]

export default function DemoFeatureSteps() {
  return (
    <div className="p-8">
      <FeatureSteps steps={steps} />
    </div>
  )
}
