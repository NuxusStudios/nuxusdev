import { GradientButton } from "@/registry/components/gradient-button"

export default function DemoGradientButton() {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4">
      <GradientButton>Get Started</GradientButton>
      <GradientButton variant="variant">Learn More</GradientButton>
    </div>
  )
}
