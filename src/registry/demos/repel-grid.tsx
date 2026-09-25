import { ArrowRight } from "lucide-react"
import { RepelGrid } from "@/registry/components/repel-grid"

export default function DemoRepelGrid() {
  return (
    <RepelGrid>
      <h1 className="mx-auto max-w-xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
        It moves when you do
      </h1>
      <p className="mx-auto mt-5 max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
        Three hundred and sixty four dots, one animation frame, and nothing in React state.
      </p>
      <a
        href="#"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Take the source
        <ArrowRight className="size-4" />
      </a>
    </RepelGrid>
  )
}
