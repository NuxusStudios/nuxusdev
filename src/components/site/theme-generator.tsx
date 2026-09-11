"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { generateTheme } from "@/server/actions/generate"
import { useBrandPreview } from "@/components/site/brand-preview-context"

const EXAMPLES = [
  "A warm editorial magazine, cream paper and ink",
  "Clinical fintech dashboard, cool greys and one blue",
  "Late-night synthwave, deep violet with hot magenta",
]

/**
 * Describe a look, get a full token set, saved as your theme.
 *
 * The generated palette goes straight into the same store the preview switcher
 * reads, so the whole site is rendered in it the moment it lands.
 */
export function ThemeGenerator({
  available,
  remaining,
  allowance,
}: {
  /** false when the server has no model configured */
  available: boolean
  remaining: number
  allowance: number
}) {
  const router = useRouter()
  const { setTheme } = useBrandPreview()
  const [brief, setBrief] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [left, setLeft] = React.useState(remaining)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    const result = await generateTheme(brief)
    setPending(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setLeft(result.data.remaining)
    setTheme("mine")
    toast(`“${result.data.name}” saved · ${result.data.remaining} credits left`)
    router.refresh()
  }

  if (!available) {
    return (
      <p className="rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-[13px] leading-relaxed text-muted-foreground">
        Theme generation isn&apos;t switched on for this server yet.
      </p>
    )
  }

  const exhausted = left <= 0

  return (
    <div className="flex flex-col gap-3">
      <form className="flex flex-wrap items-end gap-3" onSubmit={submit}>
        <label className="grid min-w-[18rem] flex-1 gap-1.5">
          <span className="text-[13px] font-medium">Describe the look</span>
          <Input
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder={EXAMPLES[0]}
            maxLength={400}
            disabled={exhausted}
            autoComplete="off"
          />
        </label>
        <Button
          type="submit"
          disabled={pending || exhausted || brief.trim().length < 8}
          className="gap-2"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Generate
        </Button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setBrief(example)}
            disabled={exhausted}
            className="rounded-full border border-border px-2.5 py-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {example}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {exhausted ? (
          <>
            No AI credits left this month.{" "}
            <Link href="/pricing" className="text-foreground underline underline-offset-4">
              Add more
            </Link>
            .
          </>
        ) : (
          <>
            Costs 1 credit · {left.toLocaleString("en-US")} of{" "}
            {allowance.toLocaleString("en-US")} left this month
          </>
        )}
      </p>
    </div>
  )
}
