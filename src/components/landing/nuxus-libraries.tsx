import Link from "next/link"
import { Marquee } from "@/registry/components/marquee"
import { SectionLabel } from "@/components/landing/component-wall"
import { rankedLibraries } from "@/lib/queries"
import { getAuthor } from "@/lib/data/authors"

export function NuxusLibraries() {
  const libraries = rankedLibraries()
  const half = Math.ceil(libraries.length / 2)
  const rows = [libraries.slice(0, half), libraries.slice(half)]

  return (
    <section className="relative overflow-hidden border-t border-border py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <SectionLabel>Every component has an author</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-[2.75rem] md:leading-[1.05]">
            Published by people,
            <br />
            not scraped from the web
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
            Design engineers and open-source libraries publish here directly. Attribution, license
            and source travel with every component you take.
          </p>
        </div>
      </div>

      <div className="relative mt-14 flex flex-col gap-4">
        {rows.map((row, index) => (
          <Marquee
            key={index}
            pauseOnHover
            reverse={index === 1}
            className="[--duration:52s] [--gap:1rem]"
          >
            {row.map((library) => {
              const author = getAuthor(library.authorHandle)
              return (
                <Link
                  key={library.slug}
                  href={`/@${library.authorHandle}/library/${library.slug}`}
                  className="group flex w-[290px] shrink-0 items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-border-strong hover:bg-accent/40"
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: library.accent ?? "#3f3f46" }}
                  >
                    {library.name.slice(0, 1)}
                  </span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-[13.5px] font-medium">{library.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {library.componentCount} components · {author.name}
                    </span>
                  </span>
                </Link>
              )
            })}
          </Marquee>
        ))}

        <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />
      </div>
    </section>
  )
}
