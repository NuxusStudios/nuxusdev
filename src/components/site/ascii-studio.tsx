"use client"

import * as React from "react"
import { Check, Copy, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCopyGate } from "@/components/site/copy-gate"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { BRAND } from "@/lib/brand"

const RAMPS: { name: string; chars: string }[] = [
  { name: "Blocks", chars: " ░▒▓█" },
  { name: "Classic", chars: " .:-=+*#%@" },
  { name: "Dots", chars: " ·•●" },
  { name: "Binary", chars: " 01" },
  { name: "Hash", chars: " .#" },
]

/**
 * Rasterises text onto an offscreen canvas, then samples the luminance of each
 * cell into a character from the ramp. Works for any glyph the browser can draw.
 */
function textToAscii(text: string, cols: number, ramp: string, invert: boolean, weight: number) {
  if (typeof document === "undefined" || !text.trim()) return ""

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  const fontSize = 100
  ctx.font = `${weight} ${fontSize}px "General Sans", system-ui, sans-serif`
  const metrics = ctx.measureText(text)
  const textWidth = Math.max(1, Math.ceil(metrics.width))
  const textHeight = Math.ceil(fontSize * 1.25)

  // characters are about twice as tall as they are wide in a monospace grid
  const rows = Math.max(1, Math.round((cols * textHeight) / textWidth / 2))
  canvas.width = cols
  canvas.height = rows

  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, cols, rows)
  ctx.fillStyle = "#fff"
  ctx.textBaseline = "middle"
  ctx.font = `${weight} ${fontSize}px "General Sans", system-ui, sans-serif`
  ctx.setTransform(cols / textWidth, 0, 0, rows / textHeight, 0, 0)
  ctx.fillText(text, 0, textHeight / 2)

  const { data } = ctx.getImageData(0, 0, cols, rows)
  const chars = invert ? [...ramp].reverse().join("") : ramp

  let out = ""
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4
      const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255
      out += chars[Math.min(chars.length - 1, Math.round(lum * (chars.length - 1)))]
    }
    out += "\n"
  }
  return out.replace(/\s+$/, "")
}

export function AsciiStudio() {
  const [text, setText] = React.useState<string>(BRAND.wordmark)
  const [cols, setCols] = React.useState(64)
  const [rampIndex, setRampIndex] = React.useState(0)
  const [invert, setInvert] = React.useState(false)
  const [bold, setBold] = React.useState(true)
  const [copied, setCopied] = React.useState<string | null>(null)
  const { copyText, canCopy } = useCopyGate()
  const preRef = React.useRef<HTMLPreElement>(null)
  const artRef = React.useRef("")

  // the canvas only exists in the browser, so the art is written straight into
  // the <pre> from an effect instead of being held in state
  React.useEffect(() => {
    const art = textToAscii(text, cols, RAMPS[rampIndex].chars, invert, bold ? 700 : 400)
    artRef.current = art
    if (preRef.current) preRef.current.textContent = art || "Type something…"
  }, [text, cols, rampIndex, invert, bold])

  const buildComponent = (art: string) => `export function AsciiArt() {
  return (
    <pre className="font-mono text-[10px] leading-[1] text-white">
{\`${art.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`}
    </pre>
  )
}`

  async function copy(value: string, kind: string) {
    const ok = await copyText(value, kind)
    if (!ok) return
    setCopied(kind)
    setTimeout(() => setCopied(null), 1600)
  }

  return (
    <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="overflow-auto rounded-2xl border border-border bg-[#08080b] p-5">
        <pre
          ref={preRef}
          className="w-max font-mono text-[8px] leading-[1] text-emerald-300/90 sm:text-[10px]"
        >
          Type something…
        </pre>
      </div>

      <div className="flex flex-col gap-5">
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium">Text</span>
          <Input value={text} onChange={(e) => setText(e.target.value)} maxLength={24} />
        </label>

        <label className="grid gap-1.5">
          <span className="flex items-center justify-between text-[13px] font-medium">
            Width <span className="tabular-nums text-muted-foreground">{cols} cols</span>
          </span>
          <input
            type="range"
            min={24}
            max={140}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="h-1 cursor-pointer appearance-none rounded-full bg-secondary accent-white"
          />
        </label>

        <div className="grid gap-1.5">
          <span className="text-[13px] font-medium">Ramp</span>
          <div className="flex flex-wrap gap-2">
            {RAMPS.map((ramp, i) => (
              <button
                key={ramp.name}
                onClick={() => setRampIndex(i)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-[13px] transition-colors",
                  rampIndex === i
                    ? "border-border-strong bg-secondary text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {ramp.name}
                <span className="ml-1.5 font-mono text-[11px] text-muted-foreground/60">
                  {ramp.chars.trim()}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Toggle on={invert} onClick={() => setInvert((v) => !v)}>Invert</Toggle>
          <Toggle on={bold} onClick={() => setBold((v) => !v)}>Bold</Toggle>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => copy(artRef.current, "ASCII")} className="gap-1.5">
            {copied === "ASCII" ? <Check className="size-3.5" /> : canCopy ? <Copy className="size-3.5" /> : <Lock className="size-3.5" />}
            Copy text
          </Button>
          <Button
            variant="secondary"
            onClick={() => copy(buildComponent(artRef.current), "Component")}
            className="gap-1.5"
          >
            {copied === "Component" ? <Check className="size-3.5" /> : canCopy ? <Copy className="size-3.5" /> : <Lock className="size-3.5" />}
            Copy component
          </Button>
        </div>
      </div>
    </div>
  )
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-[13px] transition-colors",
        on
          ? "border-border-strong bg-secondary text-foreground"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}
