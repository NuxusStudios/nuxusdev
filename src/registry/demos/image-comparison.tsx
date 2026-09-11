import { ImageComparison } from "@/registry/components/image-comparison"

export default function DemoImageComparison() {
  return (
    <div className="flex min-h-[360px] items-center justify-center p-8">
      <ImageComparison
        className="aspect-[16/9] w-full max-w-2xl"
        beforeLabel="Draft"
        afterLabel="Shipped"
        before={
          <div className="flex size-full flex-col justify-center gap-3 bg-zinc-900 px-10">
            <div className="h-3 w-2/3 rounded bg-white/15" />
            <div className="h-3 w-1/2 rounded bg-white/10" />
            <div className="mt-2 h-8 w-28 rounded bg-white/15" />
          </div>
        }
        after={
          <div className="flex size-full flex-col justify-center gap-3 bg-[radial-gradient(120%_120%_at_20%_0%,#1e3a8a,#020617)] px-10">
            <p className="text-3xl font-semibold tracking-tight text-white">Ship it properly</p>
            <p className="text-sm text-white/60">Same layout, finished.</p>
            <button className="mt-2 h-9 w-28 rounded-lg bg-white text-sm font-medium text-black">
              Get started
            </button>
          </div>
        }
      />
    </div>
  )
}
