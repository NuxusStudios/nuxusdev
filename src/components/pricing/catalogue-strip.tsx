import { COMPONENTS } from "@/lib/data/components"
import { LIBRARIES } from "@/lib/data/libraries"
import { TEMPLATES } from "@/lib/data/templates"
import { THEMES } from "@/lib/data/themes"
import { TOTAL_ICONS } from "@/server/icons"
import { formatNumber } from "@/lib/utils"

/**
 * Counted from the catalogue at render time rather than typed in, so these
 * numbers cannot drift from what the site actually contains — and nobody has
 * to remember to update them.
 */
export function CatalogueStrip() {
  const stats = [
    { value: formatNumber(COMPONENTS.length), label: "live components" },
    { value: formatNumber(TOTAL_ICONS), label: "icons, 8 open sets" },
    { value: formatNumber(THEMES.length), label: "shadcn themes" },
    { value: formatNumber(TEMPLATES.length), label: "full templates" },
    { value: formatNumber(LIBRARIES.length), label: "libraries" },
  ]

  return (
    <section className="mt-16">
      <dl className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 bg-background px-5 py-6 text-center">
            <dt className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</dt>
            <dd className="text-[13px] text-muted-foreground">{stat.label}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-center text-xs text-muted-foreground/70">
        Every plan sees the whole catalogue. Browsing and previews are free.
      </p>
    </section>
  )
}
