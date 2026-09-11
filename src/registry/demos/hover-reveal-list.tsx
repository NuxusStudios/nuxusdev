import { HoverRevealList } from "@/registry/components/hover-reveal-list"

export default function DemoHoverRevealList() {
  return (
    <div className="flex min-h-[560px] w-full flex-col items-center justify-center gap-12 bg-background px-4 py-12">
      <div className="space-y-3 text-center">
        <h2 className="font-mono text-3xl capitalize text-foreground md:text-4xl">
          Elevating interaction through motion
        </h2>
        <p className="font-mono text-sm text-muted-foreground">Hover the list to see the effect</p>
      </div>
      <HoverRevealList />
    </div>
  )
}
