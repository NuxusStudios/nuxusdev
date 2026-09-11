"use client"

import * as React from "react"
import { Check, Copy, Dices, Lock, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCopyGate } from "@/components/site/copy-gate"
import { cn } from "@/lib/utils"

type Mode = "mesh" | "linear" | "conic" | "radial"

const PRESETS: { name: string; colors: string[] }[] = [
  { name: "Aurora", colors: ["#5b2cff", "#00d4ff", "#ff2e93", "#ffb300"] },
  { name: "Deep sea", colors: ["#0f172a", "#1e40af", "#0891b2", "#22d3ee"] },
  { name: "Sunset", colors: ["#f97316", "#ef4444", "#a855f7", "#1e1b4b"] },
  { name: "Moss", colors: ["#052e16", "#15803d", "#84cc16", "#fef08a"] },
  { name: "Candy", colors: ["#f472b6", "#c084fc", "#818cf8", "#38bdf8"] },
  { name: "Ember", colors: ["#0c0a09", "#7c2d12", "#f59e0b", "#fde68a"] },
]

function randomHex() {
  return (
    "#" +
    Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")
  )
}

export function GradientStudio() {
  const [mode, setMode] = React.useState<Mode>("mesh")
  const [colors, setColors] = React.useState<string[]>(PRESETS[0].colors)
  const [angle, setAngle] = React.useState(120)
  const [copied, setCopied] = React.useState<string | null>(null)
  const { copyText, canCopy } = useCopyGate()

  const css = React.useMemo(() => {
    if (mode === "linear") return `linear-gradient(${angle}deg, ${colors.join(", ")})`
    if (mode === "conic") return `conic-gradient(from ${angle}deg, ${[...colors, colors[0]].join(", ")})`
    if (mode === "radial") return `radial-gradient(circle at 50% 30%, ${colors.join(", ")})`
    return colors
      .map((c, i) => {
        const x = [15, 85, 25, 75, 50, 10][i % 6]
        const y = [20, 15, 80, 70, 45, 90][i % 6]
        return `radial-gradient(at ${x}% ${y}%, ${c} 0px, transparent 55%)`
      })
      .join(", ")
  }, [mode, colors, angle])

  const componentCode = `export function Gradient() {
  return (
    <div
      className="size-full"
      style={{
        backgroundColor: "${colors[0]}",
        backgroundImage: \`${css}\`,
      }}
    />
  )
}`

  async function copy(value: string, kind: string) {
    const ok = await copyText(value, kind)
    if (!ok) return
    setCopied(kind)
    setTimeout(() => setCopied(null), 1600)
  }

  return (
    <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
      <div className="flex flex-col gap-4">
        <div
          className="aspect-[16/10] w-full rounded-2xl border border-border"
          style={{ backgroundColor: colors[0], backgroundImage: css }}
        />

        <div className="flex flex-wrap items-center gap-2">
          {(["mesh", "linear", "conic", "radial"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-[13px] capitalize transition-colors",
                mode === m
                  ? "border-border-strong bg-secondary text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {m}
            </button>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5"
            onClick={() => setColors(colors.map(() => randomHex()))}
          >
            <Dices className="size-3.5" />
            Shuffle
          </Button>
        </div>

        {(mode === "linear" || mode === "conic") && (
          <label className="flex items-center gap-3 text-[13px] text-muted-foreground">
            Angle
            <input
              type="range"
              min={0}
              max={360}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-white"
            />
            <span className="w-10 tabular-nums text-right">{angle}°</span>
          </label>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-[13px] font-medium">Colors</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((color, i) => (
              <div key={i} className="group relative">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5">
                  <span
                    className="size-5 rounded border border-white/10"
                    style={{ backgroundColor: color }}
                  />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) =>
                      setColors((c) => c.map((v, idx) => (idx === i ? e.target.value : v)))
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  <span className="font-mono text-[11.5px] uppercase text-muted-foreground">
                    {color}
                  </span>
                </label>
                {colors.length > 2 && (
                  <button
                    onClick={() => setColors((c) => c.filter((_, idx) => idx !== i))}
                    className="absolute -right-1.5 -top-1.5 hidden size-4 items-center justify-center rounded-full border border-border bg-popover text-muted-foreground group-hover:flex"
                  >
                    <X className="size-2.5" />
                  </button>
                )}
              </div>
            ))}
            {colors.length < 6 && (
              <button
                onClick={() => setColors((c) => [...c, randomHex()])}
                className="flex items-center gap-1.5 rounded-lg border border-dashed border-border px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
              >
                <Plus className="size-3.5" /> Add
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-[13px] font-medium">Presets</h2>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setColors(preset.colors)}
                className="group overflow-hidden rounded-lg border border-border transition-colors hover:border-border-strong"
              >
                <span
                  className="block h-10 w-full"
                  style={{
                    backgroundImage: `linear-gradient(120deg, ${preset.colors.join(", ")})`,
                  }}
                />
                <span className="block px-2 py-1 text-left text-[11.5px] text-muted-foreground">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-[#0b0b0e]">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-mono text-[11.5px] text-muted-foreground">background-image</span>
            <Button variant="ghost" size="xs" onClick={() => copy(css, "CSS")}>
              {copied === "CSS" ? <Check className="size-3.5 text-emerald-400" /> : canCopy ? <Copy className="size-3.5" /> : <Lock className="size-3.5" />}
            </Button>
          </div>
          <pre className="max-h-40 overflow-auto p-3 font-mono text-[11.5px] leading-relaxed text-foreground/70">
            {css}
          </pre>
        </div>

        <Button variant="secondary" onClick={() => copy(componentCode, "Component")} className="gap-1.5">
          {copied === "Component" ? <Check className="size-3.5" /> : canCopy ? <Copy className="size-3.5" /> : <Lock className="size-3.5" />}
          Copy as React component
        </Button>
      </div>
    </div>
  )
}
