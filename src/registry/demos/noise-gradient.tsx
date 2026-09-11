import { NoiseGradient } from "@/registry/components/noise-gradient"

export default function DemoNoiseGradient() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <NoiseGradient />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">Noise Gradient</h3>
        <p className="mt-2 text-sm text-muted-foreground">A theme gradient under real film grain</p>
      </div>
    </div>
  )
}
