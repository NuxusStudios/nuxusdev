import { VelocityMarquee } from "@/registry/components/velocity-marquee"

export default function DemoVelocityMarquee() {
  return (
    <div className="w-full">
      {/* The rows lurch with the scroll, so the demo needs somewhere to scroll. */}
      <div className="flex h-[45vh] w-full items-end justify-center bg-background pb-10">
        <p className="text-sm text-muted-foreground">Scroll, and the rows lurch with you.</p>
      </div>
      <VelocityMarquee />
      <div className="h-[60vh] w-full bg-background" />
    </div>
  )
}
