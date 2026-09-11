import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LogoMark } from "@/components/site/logo"

export function NuxusCta() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_110%,rgba(0,143,233,0.20),transparent_70%)]"
      />
      <LogoMark
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 text-foreground/[0.025]"
      />

      <div className="container-page relative flex flex-col items-center py-28 text-center">
        <h2 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-[4.25rem]">
          Stop guessing from
          <br />
          <span className="text-muted-foreground">a screenshot</span>
        </h2>
        <p className="mt-6 max-w-md text-[17px] text-muted-foreground">
          Open any component, watch it run, take the source. Free, MIT, no account needed to look.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/community/components/featured"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-[15px] font-medium text-background transition-transform hover:scale-[1.02] active:scale-100"
          >
            Browse the registry
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-12 items-center rounded-full border border-border px-7 text-[15px] font-medium transition-colors hover:border-border-strong hover:bg-accent"
          >
            Create an account
          </Link>
        </div>
      </div>
    </section>
  )
}
