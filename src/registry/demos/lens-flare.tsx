import { LensFlare } from "@/registry/components/lens-flare"

export default function DemoLensFlare() {
  return (
    <div className="relative h-[560px] w-full overflow-hidden bg-background">
      <LensFlare className="absolute inset-0" />
      <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h2 className="text-3xl font-light uppercase tracking-tight text-foreground md:text-5xl">
          Lens Flare
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          The light follows your pointer, and drifts on its own when you leave.
        </p>
      </div>
    </div>
  )
}
