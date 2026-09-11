import { LiquidMetalButton } from "@/registry/components/liquid-metal-button"

export default function DemoLiquidMetalButton() {
  return (
    <div className="flex min-h-[240px] w-full items-center justify-center gap-8 bg-background p-8">
      <LiquidMetalButton label="Get started" />
      <LiquidMetalButton iconOnly label="Generate" />
    </div>
  )
}
