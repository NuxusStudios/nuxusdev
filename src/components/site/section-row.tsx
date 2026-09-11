import Link from "next/link"
import { ComponentCard } from "@/components/site/component-card"
import type { ComponentRecord } from "@/lib/types"

export function SectionRow({
  title,
  href,
  components,
}: {
  title: string
  href: string
  components: ComponentRecord[]
}) {
  if (!components.length) return null

  return (
    <section className="py-6">
      <div className="mb-4 flex items-center justify-between gap-4 px-4 md:px-6">
        <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
        <Link
          href={href}
          className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <div className="no-scrollbar flex gap-4 overflow-x-auto px-4 pb-1 md:px-6">
        {components.map((c) => (
          <ComponentCard
            key={c.id}
            component={c}
            aspect={16 / 10}
            className="w-[280px] shrink-0 sm:w-[320px]"
          />
        ))}
      </div>
    </section>
  )
}
