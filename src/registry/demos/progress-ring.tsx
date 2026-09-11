import { ProgressRing } from "@/registry/components/progress-ring"

export default function DemoProgressRing() {
  return (
    <div className="flex min-h-[260px] items-center justify-center gap-8">
      <ProgressRing value={72} label="Coverage" />
      <ProgressRing value={38} label="Credits" gradient={["#fb7185", "#f59e0b"]} size={96} strokeWidth={7} />
    </div>
  )
}
