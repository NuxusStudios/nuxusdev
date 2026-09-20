import { ArrowRight } from "lucide-react"
import { DepthMarquee } from "@/registry/components/depth-marquee"

export default function DemoDepthMarquee() {
  return (
    <DepthMarquee>
      <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
        Built in the open
      </p>
      <h1 className="mx-auto mt-4 max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        Ship the screen, not the scaffolding
      </h1>
      <p className="mx-auto mt-5 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
        A registry of components that already run. Copy the source, keep it, change it.
      </p>
      <a
        href="#"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Browse the registry
        <ArrowRight className="size-4" />
      </a>
    </DepthMarquee>
  )
}
