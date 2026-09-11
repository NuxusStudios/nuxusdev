"use client"

import * as React from "react"
import { Check, Copy, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCopyGate } from "@/components/site/copy-gate"
import { cn, formatCount } from "@/lib/utils"
import { getAuthor } from "@/lib/data/authors"
import type { ThemeRecord } from "@/lib/types"

export function ThemeGallery({ themes }: { themes: ThemeRecord[] }) {
  const [active, setActive] = React.useState(themes[0])

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="grid gap-3 sm:grid-cols-2">
        {themes.map((theme) => {
          const author = getAuthor(theme.authorHandle)
          const isActive = theme.id === active.id
          return (
            <button
              key={theme.id}
              onClick={() => setActive(theme)}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-4 text-left transition-colors",
                isActive
                  ? "border-border-strong bg-card"
                  : "border-border bg-card/50 hover:border-border-strong"
              )}
            >
              <div className="flex gap-1.5">
                {theme.colors.map((c) => (
                  <span
                    key={c.name}
                    title={`${c.name} — ${c.value}`}
                    className="size-6 rounded-md border border-white/10"
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
              <div>
                <h2 className="text-[14px] font-semibold">{theme.name}</h2>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {theme.description}
                </p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-1 text-[11.5px] text-muted-foreground">
                <span>by {author.name}</span>
                <span className="tabular-nums">{formatCount(theme.bookmarks)}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <ThemePreview theme={active} />
      </div>
    </div>
  )
}

function ThemePreview({ theme }: { theme: ThemeRecord }) {
  const [copied, setCopied] = React.useState(false)
  const { copyText, canCopy } = useCopyGate()
  const bg = theme.colors.find((c) => c.name === "background")?.value ?? "#0a0a0c"
  const card = theme.colors.find((c) => c.name === "card")?.value ?? "#121216"
  const fg = theme.colors.find((c) => c.name === "foreground")?.value ?? "#ffffff"
  const primary = theme.colors.find((c) => c.name === "primary")?.value ?? "#008fe9"
  const border = theme.colors.find((c) => c.name === "border")?.value ?? "#26262e"
  const muted = theme.colors.find((c) => c.name === "accent")?.value ?? "#1e1e24"

  const css = [
    ":root {",
    ...Object.entries(theme.cssVars).map(([k, v]) => `  ${k}: ${v};`),
    "}",
  ].join("\n")

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-2xl border p-6"
        style={{ backgroundColor: bg, borderColor: border, color: fg }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold tracking-tight">{theme.name}</p>
            <p className="text-sm opacity-55">
              {theme.font} · radius {theme.radius}
            </p>
          </div>
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-medium"
            style={{ backgroundColor: primary, color: bg }}
          >
            Preview
          </span>
        </div>

        <div
          className="mt-5 rounded-xl border p-4"
          style={{ backgroundColor: card, borderColor: border, borderRadius: theme.radius }}
        >
          <p className="text-sm font-medium">Create your workspace</p>
          <p className="mt-1 text-[13px] opacity-55">Pick a name — you can change it later.</p>
          <div
            className="mt-3 flex h-9 items-center px-3 text-[13px] opacity-45"
            style={{ backgroundColor: muted, borderRadius: theme.radius }}
          >
            acme-inc
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="h-9 px-4 text-[13px] font-medium"
              style={{ backgroundColor: primary, color: bg, borderRadius: theme.radius }}
            >
              Continue
            </button>
            <button
              className="h-9 border px-4 text-[13px] font-medium"
              style={{ borderColor: border, borderRadius: theme.radius }}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-1.5">
          {theme.colors.map((c) => (
            <div key={c.name} className="flex flex-1 flex-col gap-1">
              <span
                className="h-8 w-full rounded-md border"
                style={{ backgroundColor: c.value, borderColor: border }}
              />
              <span className="truncate text-[9.5px] opacity-45">{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-[#0b0b0e]">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="font-mono text-[11.5px] text-muted-foreground">globals.css</span>
          <Button
            variant="ghost"
            size="xs"
            onClick={async () => {
              const ok = await copyText(css, theme.name)
              if (!ok) return
              setCopied(true)
              setTimeout(() => setCopied(false), 1600)
            }}
          >
            {copied ? <Check className="size-3.5 text-emerald-400" /> : canCopy ? <Copy className="size-3.5" /> : <Lock className="size-3.5" />}
            {copied ? "Copied" : "Copy CSS"}
          </Button>
        </div>
        <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-foreground/75">
          {css}
        </pre>
      </div>
    </div>
  )
}
