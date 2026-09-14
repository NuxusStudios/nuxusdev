import { ArrowRight, Sparkles } from "lucide-react"
import { HaloButton } from "@/registry/components/halo-button"

export default function DemoHaloButton() {
  return (
    <div className="flex min-h-[360px] w-full flex-col items-center justify-center gap-8 bg-background p-8">
      <HaloButton size="lg">
        Start building free
        <ArrowRight className="size-4" />
      </HaloButton>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <HaloButton accent="#34d399">
          <Sparkles className="size-4" />
          Generate a theme
        </HaloButton>
        <HaloButton accent="#f59e0b" size="sm">
          Upgrade to Pro
        </HaloButton>
        <HaloButton size="sm" disabled>
          Sold out
        </HaloButton>
      </div>
    </div>
  )
}
