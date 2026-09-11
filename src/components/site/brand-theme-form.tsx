"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Palette, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { clearTheme, saveTheme } from "@/server/actions/brand-theme"
import { ComponentPreview } from "@/components/site/component-preview"
import { useBrandPreview } from "@/components/site/brand-preview-context"
import { ThemeGenerator } from "@/components/site/theme-generator"

const PLACEHOLDER = `:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.55 0.22 264);
  --radius: 0.625rem;
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}`

export function BrandThemeForm({
  saved,
  credits,
}: {
  saved: { name: string; coverage: number; updatedAt: string } | null
  credits: { available: boolean; remaining: number; allowance: number }
}) {
  const router = useRouter()
  const { setTheme } = useBrandPreview()
  const [name, setName] = React.useState(saved?.name ?? "My theme")
  const [css, setCss] = React.useState("")
  const [pending, setPending] = React.useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    const result = await saveTheme(name, css)
    setPending(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    const { light, dark, ignored } = result.data
    toast(
      `Saved ${light} token${light === 1 ? "" : "s"}` +
        (dark ? ` and ${dark} dark override${dark === 1 ? "" : "s"}` : "") +
        (ignored.length ? ` · ignored ${ignored.length} we don't render` : "")
    )

    setCss("")
    setTheme("mine")
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-[13px] font-medium">Generate one</p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
          Describe the look you want and we&apos;ll build the whole token set, light and dark.
        </p>
        <div className="mt-4">
          <ThemeGenerator
            available={credits.available}
            remaining={credits.remaining}
            allowance={credits.allowance}
          />
        </div>
      </div>

      {saved && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-3.5 py-3">
          <Palette className="size-4 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{saved.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {saved.coverage} token{saved.coverage === 1 ? "" : "s"} · updated{" "}
              {new Date(saved.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-destructive"
            onClick={async () => {
              const result = await clearTheme()
              if (!result.ok) {
                toast.error(result.error)
                return
              }
              setTheme(null)
              toast("Theme removed")
              router.refresh()
            }}
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
        </div>
      )}

      {saved && (
        <div>
          <p className="mb-2 text-[13px] font-medium">In your theme</p>
          <ComponentPreview previewKey="glow-card" aspect={16 / 9} eager />
        </div>
      )}

      <form className="flex flex-col gap-3" onSubmit={submit}>
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium">Name</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            className="max-w-xs"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium">
            {saved ? "Replace with new CSS" : "Paste your theme CSS"}
          </span>
          <Textarea
            value={css}
            onChange={(event) => setCss(event.target.value)}
            placeholder={PLACEHOLDER}
            rows={10}
            spellCheck={false}
            className="font-mono text-[12px]"
          />
          <span className="text-xs leading-relaxed text-muted-foreground">
            The <code>:root</code> and <code>.dark</code> blocks from your{" "}
            <code>globals.css</code>. We read the standard shadcn tokens and ignore everything
            else — nothing from the paste is ever executed.
          </span>
        </label>

        <div>
          <Button type="submit" disabled={pending || css.trim().length === 0} className="gap-2">
            {pending && <Loader2 className="size-4 animate-spin" />}
            {saved ? "Replace theme" : "Save theme"}
          </Button>
        </div>
      </form>
    </div>
  )
}
