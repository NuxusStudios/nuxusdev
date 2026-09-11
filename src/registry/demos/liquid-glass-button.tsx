import { LiquidGlassButton } from "@/registry/components/liquid-glass-button"

export default function DemoLiquidGlassButton() {
  return (
    <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#1e3a8a_0%,#020617_60%)]">
      <div className="absolute size-56 rounded-full bg-blue-500/30 blur-3xl" />
      <LiquidGlassButton>Continue with glass</LiquidGlassButton>
    </div>
  )
}
