import { ShimmerButton } from "@/registry/components/shimmer-button"

export default function DemoShimmerButton() {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <ShimmerButton className="shadow-2xl">
        <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-foreground lg:text-lg">
          Shimmer Button
        </span>
      </ShimmerButton>
    </div>
  )
}
