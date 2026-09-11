import { WaveLines } from "@/registry/components/wave-lines"

export default function DemoWaveLines() {
  return (
    <div className="relative flex min-h-[380px] w-full items-center justify-center overflow-hidden bg-card">
      <WaveLines className="absolute inset-0" color="rgba(120,180,255,0.35)" />
      <h2 className="relative z-10 text-5xl font-semibold tracking-tighter text-foreground mix-blend-difference">
        Wave Lines
      </h2>
    </div>
  )
}
