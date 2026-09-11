import { MagneticButton } from "@/registry/components/magnetic-button"

export default function DemoMagneticButton() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center gap-4">
      <MagneticButton>Hover near me</MagneticButton>
      <p className="text-sm text-foreground/35">The button leans toward your cursor.</p>
    </div>
  )
}
