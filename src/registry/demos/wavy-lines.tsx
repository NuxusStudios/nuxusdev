import { WavyLines } from "@/registry/components/wavy-lines"

export default function DemoWavyLines() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <WavyLines />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">Wavy Lines</h3>
        <p className="mt-2 text-sm text-muted-foreground">Stacked sine waves drifting sideways</p>
      </div>
    </div>
  )
}
