import { TextShimmer } from "@/registry/components/text-shimmer"

export default function DemoTextShimmer() {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <TextShimmer className="text-2xl font-medium" duration={1.6}>
        Generating your component…
      </TextShimmer>
    </div>
  )
}
