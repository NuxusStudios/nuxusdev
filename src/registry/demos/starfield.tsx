import { Starfield } from "@/registry/components/starfield"

export default function DemoStarfield() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <Starfield />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">Starfield</h3>
        <p className="mt-2 text-sm text-muted-foreground">Seeded stars that twinkle without hydration drift</p>
      </div>
    </div>
  )
}
