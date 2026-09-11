import { AnimatedGrid } from "@/registry/components/animated-grid"

export default function DemoAnimatedGrid() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <AnimatedGrid />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">Animated Grid</h3>
        <p className="mt-2 text-sm text-muted-foreground">A perspective grid scrolling toward the horizon</p>
      </div>
    </div>
  )
}
