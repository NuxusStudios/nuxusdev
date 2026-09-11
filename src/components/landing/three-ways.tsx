"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Check, Code2, Sparkles, Terminal } from "lucide-react"
import { SectionLabel } from "@/components/landing/component-wall"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

type Mode = "prompt" | "code" | "cli"

const MODES: { id: Mode; label: string; icon: React.ReactNode; blurb: string }[] = [
  {
    id: "prompt",
    label: "Copy the prompt",
    icon: <Sparkles className="size-4" />,
    blurb: "One prompt, no tool picker. The same text works in Claude Code, Antigravity, Cursor, Codex, Lovable, v0 or Bolt — it writes the files, wires the demo and adapts the colours to your theme.",
  },
  {
    id: "code",
    label: "Copy the code",
    icon: <Code2 className="size-4" />,
    blurb: "The exact source the preview renders — React and Tailwind, shadcn conventions, no wrapper package to install.",
  },
  {
    id: "cli",
    label: "Run the CLI",
    icon: <Terminal className="size-4" />,
    blurb: "One command drops the component and its demo into your project through the shadcn registry.",
  },
]

const PANELS: Record<Mode, { file: string; lines: { text: string; tone?: "add" | "dim" | "brand" }[] }> = {
  prompt: {
    file: "prompt.txt",
    lines: [
      { text: "Add this component to my project. Create the files", tone: "dim" },
      { text: "exactly as given, then wire the demo into the page.", tone: "dim" },
      { text: "" },
      { text: "Component: Glow Card — pointer-tracked border glow", tone: "brand" },
      { text: `Source: ${BRAND.domain}/@solstice/components/glow-card`, tone: "dim" },
      { text: "" },
      { text: "Create `components/ui/glow-card.tsx`:", tone: "dim" },
      { text: "```tsx" },
      { text: '"use client"' },
      { text: "" },
      { text: 'import { cn } from "@/lib/utils"' },
      { text: "" },
      { text: "export function GlowCard({ children, className }) {" },
      { text: "  …" },
    ],
  },
  code: {
    file: "glow-card.tsx",
    lines: [
      { text: '"use client"' },
      { text: "" },
      { text: 'import * as React from "react"' },
      { text: 'import { cn } from "@/lib/utils"' },
      { text: "" },
      { text: "export function GlowCard({ children, className }) {" },
      { text: "  const ref = React.useRef<HTMLDivElement>(null)" },
      { text: "" },
      { text: "  function onMove(e: React.MouseEvent) {" },
      { text: "    const r = ref.current?.getBoundingClientRect()" },
      { text: "    if (!r) return" },
      { text: '    ref.current!.style.setProperty("--x", `${e.clientX - r.left}px`)' },
      { text: "  }" },
      { text: "  …" },
    ],
  },
  cli: {
    file: "terminal",
    lines: [
      { text: `$ npx shadcn@latest add "${BRAND.domain}/r/solstice/glow-card"`, tone: "brand" },
      { text: "" },
      { text: "✔ Checking registry.", tone: "add" },
      { text: "✔ Installing dependencies.", tone: "add" },
      { text: "✔ Created 2 files:", tone: "add" },
      { text: "  - components/ui/glow-card.tsx", tone: "dim" },
      { text: "  - components/glow-card-demo.tsx", tone: "dim" },
      { text: "" },
      { text: "Done in 1.8s", tone: "dim" },
    ],
  },
}

export function ThreeWays() {
  const [mode, setMode] = React.useState<Mode>("prompt")
  const panel = PANELS[mode]

  return (
    <section className="border-t border-border py-24">
      <div className="container-page">
        <div className="max-w-2xl">
          <SectionLabel>One component, three exits</SectionLabel>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-[2.75rem] md:leading-[1.05]">
            Take it however
            <br />
            you actually work
          </h2>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div className="flex flex-col gap-2">
            {MODES.map((item) => {
              const active = item.id === mode
              return (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-5 text-left transition-colors",
                    active
                      ? "border-border-strong bg-card"
                      : "border-border bg-card/40 hover:border-border-strong hover:bg-card/70"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="three-ways-glow"
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(320px_circle_at_0%_0%,rgba(0,143,233,0.14),transparent_70%)]"
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <div className="relative flex items-center gap-2.5">
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-lg border transition-colors",
                        active
                          ? "border-brand/40 bg-brand/15 text-brand"
                          : "border-border bg-secondary/50 text-muted-foreground"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className={cn("text-[15px] font-medium", !active && "text-foreground/80")}>
                      {item.label}
                    </span>
                  </div>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.blurb}
                  </p>
                </button>
              )
            })}
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-[#08080b]">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
              <span className="flex gap-1.5">
                {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
                  <span key={color} className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
                ))}
              </span>
              <span className="ml-2 font-mono text-[11.5px] text-muted-foreground">{panel.file}</span>
              <span className="ml-auto flex items-center gap-1 text-[11.5px] text-muted-foreground">
                <Check className="size-3 text-emerald-400" />
                copied
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.pre
                key={mode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="min-h-[340px] overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75]"
              >
                {panel.lines.map((line, i) => (
                  <div
                    key={i}
                    className={cn(
                      "whitespace-pre",
                      line.tone === "add" && "text-emerald-400",
                      line.tone === "brand" && "text-sky-300",
                      line.tone === "dim" && "text-muted-foreground",
                      !line.tone && "text-foreground/80"
                    )}
                  >
                    {line.text || " "}
                  </div>
                ))}
              </motion.pre>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
