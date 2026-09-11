import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Bug, Check, GitPullRequest, ScanEye, Wand2 } from "lucide-react"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Design Bug Bot",
  description:
    "Catch UI issues in pull requests and get the code to fix them. Five free reviews in your first week on a paid plan.",
}

const FINDINGS = [
  { severity: "High", title: "Focus ring is invisible on the primary button", file: "components/ui/button.tsx:24" },
  { severity: "Medium", title: "Card padding drifts from the 4px scale (13px)", file: "components/pricing-card.tsx:40" },
  { severity: "Medium", title: "Text contrast 3.1:1 on muted labels", file: "app/dashboard/page.tsx:88" },
  { severity: "Low", title: "Hover state missing on the secondary link", file: "components/site-footer.tsx:52" },
]

const STEPS = [
  { icon: <GitPullRequest className="size-5" />, title: "Open a pull request", body: "Bug Bot picks it up automatically — no config beyond installing the app." },
  { icon: <ScanEye className="size-5" />, title: "It renders your changes", body: "Every changed route is screenshotted at three breakpoints and compared to your tokens." },
  { icon: <Wand2 className="size-5" />, title: "You get fix code", body: "Each finding comes with a diff you can accept, not just a screenshot with a red box." },
]

export default function DesignBugBotPage() {
  return (
    <>
      <SiteHeader />

      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(70%_60%_at_50%_-10%,rgba(0,143,233,0.2),transparent_70%)]"
        />

        <div className="container-page relative py-16">
          <div className="flex flex-col items-center text-center">
            <Badge variant="brand" className="mb-5 gap-1.5 px-3 py-1">
              <Bug className="size-3.5" /> Design Bug Bot
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Catch UI issues in pull requests
              <br />
              <span className="text-muted-foreground">and get code to fix them</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] text-muted-foreground">
              Bug Bot reviews the design of every PR — spacing drift, contrast failures, dead focus
              states — and leaves a diff, not a lecture.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/pricing">
                  Add Bug Bot <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/blog/introducing-design-bug-bot">Read the announcement</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/70">
              5 free reviews in your first week on a paid plan.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="flex items-center gap-2 text-[13px] font-medium">
                <Bug className="size-4 text-brand" />
                Design Bug Bot reviewed this PR
              </span>
              <span className="text-xs text-muted-foreground">4 findings · 18s</span>
            </div>
            <ul className="divide-y divide-border">
              {FINDINGS.map((f) => (
                <li key={f.title} className="flex items-start gap-3 px-4 py-3.5">
                  <span
                    className={
                      f.severity === "High"
                        ? "mt-0.5 rounded-full bg-rose-500/12 px-2 py-0.5 text-[11px] font-medium text-rose-300"
                        : f.severity === "Medium"
                          ? "mt-0.5 rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-medium text-amber-300"
                          : "mt-0.5 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    }
                  >
                    {f.severity}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px]">{f.title}</span>
                    <span className="block font-mono text-[11.5px] text-muted-foreground">
                      {f.file}
                    </span>
                  </span>
                  <button className="shrink-0 rounded-md border border-border px-2 py-1 text-[11.5px] text-muted-foreground transition-colors hover:text-foreground">
                    View fix
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl border border-border bg-secondary/50 text-muted-foreground">
                  {step.icon}
                </div>
                <h2 className="text-[15px] font-semibold">{step.title}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-border bg-card p-8">
            <h2 className="text-xl font-semibold tracking-tight">What it checks</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                "Spacing off the 4px scale",
                "Colour contrast below WCAG AA",
                "Missing or invisible focus states",
                "Inconsistent radii across siblings",
                "Text that clips or overflows",
                "Layout shift on hover",
                "Hard-coded colours outside the token set",
                "Touch targets under 44px",
                "Breakpoint regressions at 375px",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-400/70" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
