import { RipplePulse } from "@/registry/components/ripple-pulse"

export default function DemoRipplePulse() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <RipplePulse />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">Ripple Pulse</h3>
        <p className="mt-2 text-sm text-muted-foreground">Concentric rings expanding like sonar</p>
      </div>
    </div>
  )
}
