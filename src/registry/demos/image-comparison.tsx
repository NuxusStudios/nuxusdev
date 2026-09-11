import { ImageComparison } from "@/registry/components/image-comparison"

export default function DemoImageComparison() {
  return (
    <div className="flex min-h-[360px] items-center justify-center p-8">
      <ImageComparison
        className="aspect-[16/9] w-full max-w-2xl"
        beforeLabel="Draft"
        afterLabel="Shipped"
        before={
          <div className="flex size-full flex-col justify-center gap-3 bg-background px-10">
            <div className="h-3 w-2/3 rounded bg-foreground/15" />
            <div className="h-3 w-1/2 rounded bg-foreground/10" />
            <div className="mt-2 h-8 w-28 rounded bg-foreground/15" />
          </div>
        }
        after={
          <div className="flex size-full flex-col justify-center gap-3 bg-[radial-gradient(120%_120%_at_20%_0%,#1e3a8a,#020617)] px-10">
            <p className="text-3xl font-semibold tracking-tight text-foreground">Ship it properly</p>
            <p className="text-sm text-foreground/60">Same layout, finished.</p>
            <button className="mt-2 h-9 w-28 rounded-lg bg-foreground text-sm font-medium text-background">
              Get started
            </button>
          </div>
        }
      />
    </div>
  )
}
