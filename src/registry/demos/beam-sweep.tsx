import { BeamSweep } from "@/registry/components/beam-sweep"

export default function DemoBeamSweep() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <BeamSweep />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">Beam Sweep</h3>
        <p className="mt-2 text-sm text-muted-foreground">Wide light beams passing across the surface</p>
      </div>
    </div>
  )
}
