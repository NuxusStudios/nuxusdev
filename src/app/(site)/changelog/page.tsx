import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { CHANGELOG, type ChangelogEntry } from "@/lib/data/changelog"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Changelog",
  description: `Everything that has shipped on ${BRAND.name}, newest first.`,
}

const KIND_LABEL = { added: "Added", improved: "Improved", fixed: "Fixed" } as const

const KIND_CLASS = {
  added: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  improved: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  fixed: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
} as const

export default function ChangelogPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-page max-w-3xl py-14">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Changelog</h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          Everything that has shipped, newest first. Work still in development lives on the
          roadmap, not here.
        </p>

        <div className="mt-14 flex flex-col">
          {CHANGELOG.map((entry) => (
            <Entry key={entry.version} entry={entry} />
          ))}
        </div>
      </div>
    </>
  )
}

function Entry({ entry }: { entry: ChangelogEntry }) {
  return (
    <article className="relative grid gap-x-10 gap-y-4 border-t border-border py-10 md:grid-cols-[8rem_1fr]">
      <div className="md:sticky md:top-24 md:self-start">
        <time
          dateTime={entry.date}
          className="block text-[13px] font-medium tabular-nums text-muted-foreground"
        >
          {/* the dates are calendar days, so render them in UTC — otherwise a
              negative local offset shows the day before */}
          {new Date(entry.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}
        </time>
        <span className="mt-1.5 inline-block rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          v{entry.version}
        </span>
      </div>

      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight">{entry.title}</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{entry.summary}</p>

        <ul className="mt-5 flex flex-col gap-3">
          {entry.changes.map((change) => (
            <li key={change.text} className="flex flex-col gap-1.5 sm:flex-row sm:gap-3">
              <span
                className={cn(
                  "h-fit w-fit shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                  KIND_CLASS[change.kind]
                )}
              >
                {KIND_LABEL[change.kind]}
              </span>
              <span className="text-[14px] leading-relaxed text-foreground/85">{change.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
