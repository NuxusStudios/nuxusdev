import { GradientOrbs } from "@/registry/components/gradient-orbs"

export default function DemoGradientOrbs() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <GradientOrbs />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">Gradient Orbs</h3>
        <p className="mt-2 text-sm text-muted-foreground">Soft orbs drifting in your theme&rsquo;s colours</p>
      </div>
    </div>
  )
}
