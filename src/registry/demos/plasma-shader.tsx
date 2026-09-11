import { PlasmaShader } from "@/registry/components/plasma-shader"

export default function DemoPlasmaShader() {
  return (
    <div className="relative flex min-h-[420px] w-full items-center justify-center overflow-hidden bg-black">
      <PlasmaShader className="absolute inset-0" />
      <div className="relative z-10 rounded-2xl border border-white/20 bg-black/30 px-8 py-6 text-center backdrop-blur-xl">
        <h2 className="text-4xl font-semibold tracking-tight text-white">Plasma</h2>
        <p className="mt-2 text-sm text-white/70">A real fragment shader, 30 lines of GLSL.</p>
      </div>
    </div>
  )
}
