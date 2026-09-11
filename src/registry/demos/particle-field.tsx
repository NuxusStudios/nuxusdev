import { ParticleField } from "@/registry/components/particle-field"

export default function DemoParticleField() {
  return (
    <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden bg-card">
      <ParticleField className="absolute inset-0" />
      <div className="pointer-events-none relative text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-foreground">Particle Field</h2>
        <p className="mt-2 text-foreground/45">Move your cursor through it.</p>
      </div>
    </div>
  )
}
