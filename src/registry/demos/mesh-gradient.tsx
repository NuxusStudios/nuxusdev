import { MeshGradient } from "@/registry/components/mesh-gradient"

export default function DemoMeshGradient() {
  return (
    <div className="relative flex min-h-[400px] w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-70">
        <MeshGradient />
      </div>
      <div className="relative z-10 text-center">
        <h2 className="text-5xl font-semibold tracking-tighter text-foreground">Mesh Gradient</h2>
        <p className="mt-3 text-foreground/60">Canvas, 60fps, zero dependencies.</p>
      </div>
    </div>
  )
}
