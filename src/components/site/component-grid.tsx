import { ComponentCard } from "@/components/site/component-card"
import { cn } from "@/lib/utils"
import type { ComponentRecord } from "@/lib/types"

export function ComponentGrid({
  components,
  className,
  columns = "responsive",
}: {
  components: ComponentRecord[]
  className?: string
  columns?: "responsive" | "three" | "two"
}) {
  return (
    <div
      className={cn(
        "grid gap-x-5 gap-y-7",
        columns === "responsive" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
        columns === "three" && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        columns === "two" && "grid-cols-1 md:grid-cols-2",
        className
      )}
    >
      {components.map((c) => (
        <ComponentCard key={c.id} component={c} />
      ))}
    </div>
  )
}
