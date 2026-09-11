import { AlertTriangle, Check, Minus, TriangleAlert } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { CHECKS, getAnalysis, VERDICT_LABEL } from "@/lib/quality"
import type { Verdict } from "@/lib/analysis"
import { cn } from "@/lib/utils"

const STYLE: Record<Verdict, string> = {
  pass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  partial: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  fail: "border-border bg-muted/50 text-muted-foreground",
  unknown: "border-border bg-muted/40 text-muted-foreground/70",
}

const ICON: Record<Verdict, React.ReactNode> = {
  pass: <Check className="size-3" />,
  partial: <TriangleAlert className="size-3" />,
  fail: <AlertTriangle className="size-3" />,
  unknown: <Minus className="size-3" />,
}

/**
 * Mechanical checks, shown as badges.
 *
 * Every badge is derived from the component's source, so the tooltip can say
 * exactly what was counted rather than asserting a quality score.
 */
export function QualityBadges({
  componentId,
  className,
}: {
  componentId: string
  className?: string
}) {
  const analysis = getAnalysis(componentId)
  if (!analysis) return null

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {CHECKS.map((check) => {
        const verdict = analysis[check.id]
        return (
          <Tooltip key={check.id}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                  STYLE[verdict]
                )}
              >
                {ICON[verdict]}
                {check.label}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[16rem]">
              <p className="font-medium">
                {check.label}: {VERDICT_LABEL[verdict]}
              </p>
              <p className="mt-1 text-muted-foreground">
                {verdict === "pass" ? check.passes : check.fails}
              </p>
              {check.id === "themeable" && (
                <p className="mt-1 text-muted-foreground">
                  {analysis.stats.tokenClasses} token
                  {analysis.stats.tokenClasses === 1 ? "" : "s"},{" "}
                  {analysis.stats.hardCodedColours} hard-coded colour
                  {analysis.stats.hardCodedColours === 1 ? "" : "s"}.
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
