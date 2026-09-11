import { Topographic } from "@/registry/components/topographic"

export default function DemoTopographic() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <Topographic />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">Topographic</h3>
        <p className="mt-2 text-sm text-muted-foreground">Contour lines that rotate imperceptibly</p>
      </div>
    </div>
  )
}
