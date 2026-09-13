import { FrostReveal } from "@/registry/components/frost-reveal"

export default function DemoFrostReveal() {
  return (
    <div className="relative h-[560px] w-full overflow-hidden bg-background">
      <FrostReveal alt="Fog moving through a forested valley at first light" />
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-12">
        <h2 className="max-w-[16ch] text-3xl font-medium leading-[1.05] tracking-tight text-white sm:text-5xl">
          Design that feels found,
          <br />
          not shown.
        </h2>
        <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/65">
          Move your cursor across the image. The frost drifts back in behind you.
        </p>
      </div>
    </div>
  )
}
