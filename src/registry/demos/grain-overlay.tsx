import { GrainOverlay } from "@/registry/components/grain-overlay"

export default function DemoGrainOverlay() {
  return (
    <div className="relative flex min-h-[340px] w-full items-center justify-center overflow-hidden bg-[radial-gradient(120%_120%_at_30%_10%,#3b1d6e,#0a0616_65%)]">
      <GrainOverlay opacity={0.16} />
      <div className="relative z-10 text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-foreground">Film Grain</h2>
        <p className="mt-2 text-sm text-foreground/55">Animated noise, blended over anything.</p>
      </div>
    </div>
  )
}
