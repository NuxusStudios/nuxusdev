"use client"

import * as React from "react"
import {
  ArrowUpRight,
  BrainCircuit,
  Code2,
  GitBranch,
  MapPin,
  Radio,
  Rocket,
  Terminal,
  Users,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const PROJECTS = [
  { id: "relay", name: "relay", load: 94, state: "shipping" },
  { id: "squall", name: "squall", load: 81, state: "active" },
  { id: "tessera", name: "tessera", load: 63, state: "building" },
  { id: "halyard", name: "halyard", load: 52, state: "active" },
  { id: "quill", name: "quill", load: 36, state: "paused" },
] as const

const LOG = [
  { at: "04:52", line: "relay · production deploy", reverted: false },
  { at: "03:18", line: "tessera · component pass", reverted: false },
  { at: "01:46", line: "squall · planner updated", reverted: false },
  { at: "00:21", line: "halyard · schema reverted", reverted: true },
] as const

/** Shares of the build. Rendered as one bar, so these must total 100. */
const STACK = [
  { label: "typescript", pct: 39, tone: "var(--color-primary)" },
  { label: "next.js", pct: 27, tone: "color-mix(in oklch, var(--color-primary) 55%, transparent)" },
  { label: "inference", pct: 22, tone: "color-mix(in oklch, var(--color-primary) 30%, transparent)" },
  { label: "infra", pct: 12, tone: "color-mix(in oklch, var(--color-foreground) 16%, transparent)" },
]

const CREW = ["AD", "RK", "MO", "+9"]

/** Sampled throughput, oldest first. Drives the sparkline. */
const TREND = [18, 22, 19, 28, 26, 34, 31, 40, 37, 46, 42, 52, 48, 58]

/**
 * A personal operations panel: what is running, what shipped, what it is
 * costing. Built for a founder's landing page or a developer-tool hero.
 *
 * The counter writes through a ref rather than through state. A number that
 * changes every second and a grid of nine tilting cells do not belong in the
 * same render pass — putting them there re-renders the whole panel for a digit.
 *
 * Both the sparkline and the uptime ring set `pathLength="1"`, which rescales
 * the dash unit to a fraction of the path. That turns "draw 78% of this" into a
 * literal 0.78 and removes the usual getTotalLength() measuring pass entirely.
 */
export function OperatorBento({
  handle = "nuxus.ops",
  status = "shipping",
  focus = "relay",
  focusNote = "agent infrastructure",
  base = "lisbon",
  uptime = 99.8,
  className,
}: {
  handle?: string
  status?: string
  focus?: string
  focusNote?: string
  base?: string
  uptime?: number
  className?: string
}) {
  const counter = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const node = counter.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let value = 184_700
    const id = window.setInterval(() => {
      // Biased upward so the number trends rather than wanders.
      value = Math.max(0, value + Math.round((Math.random() - 0.38) * 120))
      node.textContent = value.toLocaleString()
    }, 1700)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className={cn("flex w-full justify-center bg-background p-6 text-foreground", className)}>
      <div className="w-full max-w-[880px] rounded-2xl border border-border bg-card/40 p-5">
        <header className="flex items-center justify-between px-1.5 pb-4">
          <div className="flex items-center gap-2.5">
            <LiveDot />
            <span className="text-[0.82rem] font-semibold tracking-tight">{handle}</span>
            <span className="text-[0.75rem] text-muted-foreground">/ {status}</span>
          </div>
          <span className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground [animation:ops-breathe_3.2s_ease-in-out_infinite] motion-reduce:[animation:none]">
            <Radio className="size-3" strokeWidth={2} aria-hidden />
            live
          </span>
        </header>

        <div data-ops-grid className="grid gap-2.5">
          <Cell area="usage" index={0}>
            <Label icon={BrainCircuit}>tokens / hour</Label>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span ref={counter} className="text-[2.6rem] font-light leading-none tabular-nums">
                184,700
              </span>
              <span className="inline-flex items-center gap-0.5 text-[0.7rem] font-semibold text-primary">
                <ArrowUpRight className="size-3" strokeWidth={2.5} aria-hidden />
                12.4%
              </span>
            </div>
            <div className="mt-3 min-h-0 flex-1">
              <Sparkline />
            </div>
          </Cell>

          <Cell area="uptime" index={1} className="items-center justify-center">
            <Ring pct={uptime} />
          </Cell>

          <Cell area="focus" index={2}>
            <Label icon={Rocket}>current focus</Label>
            <p className="mt-1.5 text-lg font-medium italic">{focus}</p>
            <p className="mt-auto flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
              <LiveDot size={6} />
              {focusNote}
            </p>
          </Cell>

          <Cell area="projects" index={3}>
            <Label icon={Code2}>active projects · {PROJECTS.length}</Label>
            <ul className="mt-3 flex flex-1 flex-col gap-2.5">
              {PROJECTS.map((project, i) => (
                <li key={project.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[0.7rem]">
                    <span className={project.state === "shipping" ? "text-foreground" : "text-muted-foreground"}>
                      {project.name}
                    </span>
                    <span className="text-[0.6rem] tabular-nums text-muted-foreground">{project.load}%</span>
                  </div>
                  <span className="block h-0.5 w-full shrink-0 overflow-hidden rounded-full bg-border">
                    <span
                      className="block h-full rounded-full [animation:ops-fill_700ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:[animation:none]"
                      style={{
                        width: `${project.load}%`,
                        animationDelay: `${340 + i * 70}ms`,
                        backgroundColor:
                          project.state === "shipping"
                            ? "var(--color-primary)"
                            : "color-mix(in oklch, var(--color-foreground) 28%, transparent)",
                      }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </Cell>

          <Cell area="log" index={4}>
            <Label icon={Terminal}>deploy log</Label>
            <ul className="mt-2.5 flex flex-col gap-1.5 overflow-hidden">
              {LOG.map((entry, i) => (
                <li
                  key={entry.at}
                  className="flex gap-2.5 whitespace-nowrap text-[0.7rem] [animation:ops-slide_420ms_ease_both] motion-reduce:[animation:none]"
                  style={{ animationDelay: `${260 + i * 90}ms` }}
                >
                  <span className="shrink-0 tabular-nums text-muted-foreground/70">{entry.at}</span>
                  <span
                    className={cn(
                      "overflow-hidden text-ellipsis",
                      entry.reverted ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {entry.line}
                  </span>
                </li>
              ))}
            </ul>
          </Cell>

          <Cell area="stack" index={5}>
            <Label>build stack</Label>
            <div className="mt-3.5 flex h-1.5 shrink-0 overflow-hidden rounded-full bg-border">
              {STACK.map((slice, i) => (
                <span
                  key={slice.label}
                  className="block h-full [animation:ops-fill_800ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:[animation:none]"
                  style={{
                    width: `${slice.pct}%`,
                    backgroundColor: slice.tone,
                    animationDelay: `${300 + i * 80}ms`,
                  }}
                />
              ))}
            </div>
            <ul className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5">
              {STACK.map((slice) => (
                <li key={slice.label} className="flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
                  <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: slice.tone }} />
                  {slice.label}
                  <span className="tabular-nums text-muted-foreground/60">{slice.pct}%</span>
                </li>
              ))}
            </ul>
          </Cell>

          <Cell area="region" index={6}>
            <Label icon={MapPin}>base</Label>
            <p className="mt-3 text-2xl font-light italic leading-none">{base}</p>
            <p className="mt-1.5 text-[0.65rem] text-muted-foreground">shipping globally</p>
          </Cell>

          <Cell area="team" index={7} className="flex-row items-center justify-between">
            <div>
              <Label icon={Users}>collaborators</Label>
              <div className="mt-2 flex">
                {CREW.map((who, i) => (
                  <span
                    key={who}
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full border border-border bg-card text-[0.55rem]",
                      "transition-transform hover:-translate-y-0.5",
                      i === 0 ? "text-foreground" : "text-muted-foreground",
                    )}
                    style={{ marginLeft: i === 0 ? 0 : -7, zIndex: CREW.length - i }}
                  >
                    {who}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <Label icon={GitBranch}>last ship</Label>
              <p className="mt-2 text-[0.7rem] text-muted-foreground [animation:ops-breathe_3s_ease-in-out_infinite] motion-reduce:[animation:none]">
                19m ago
              </p>
            </div>
          </Cell>
        </div>
      </div>

      <style>{`
        [data-ops-grid] { grid-template-columns: 1fr; grid-auto-rows: minmax(7rem, auto) }
        @media (min-width: 768px) {
          [data-ops-grid] {
            grid-template-columns: 1.55fr 1fr 1fr 1.05fr;
            grid-template-rows: 7rem 7rem 7rem 6rem;
            grid-template-areas:
              "usage usage uptime projects"
              "usage usage focus  projects"
              "log   stack stack  projects"
              "log   region team  team";
          }
          [data-ops-cell="usage"]    { grid-area: usage }
          [data-ops-cell="uptime"]   { grid-area: uptime }
          [data-ops-cell="focus"]    { grid-area: focus }
          [data-ops-cell="projects"] { grid-area: projects }
          [data-ops-cell="log"]      { grid-area: log }
          [data-ops-cell="stack"]    { grid-area: stack }
          [data-ops-cell="region"]   { grid-area: region }
          [data-ops-cell="team"]     { grid-area: team }
        }
        @keyframes ops-rise { from { opacity: 0; transform: translateY(14px) scale(0.985) } to { opacity: 1; transform: none } }
        @keyframes ops-slide { from { opacity: 0; transform: translateX(-8px) } to { opacity: 1; transform: none } }
        @keyframes ops-fill { from { width: 0 } }
        @keyframes ops-breathe { 0%, 100% { opacity: 0.65 } 50% { opacity: 1 } }
        @keyframes ops-ping { 0% { transform: scale(1); opacity: 0.35 } 70%, 100% { transform: scale(1.6); opacity: 0 } }
        @keyframes ops-draw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
      `}</style>
    </div>
  )
}

function Cell({
  area,
  index,
  className,
  children,
}: {
  area: string
  index: number
  className?: string
  children: React.ReactNode
}) {
  // Tilt is written to custom properties on the element so the transform stays
  // in CSS — routing pointer coordinates through React state would re-render
  // the whole panel on every mouse move.
  const lean = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty("--ry", `${x * 1.6}deg`)
    event.currentTarget.style.setProperty("--rx", `${-y * 1.6}deg`)
  }

  const level = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--ry", "0deg")
    event.currentTarget.style.setProperty("--rx", "0deg")
  }

  return (
    <div
      data-ops-cell={area}
      onPointerMove={lean}
      onPointerLeave={level}
      className={cn(
        "group relative flex min-w-0 flex-col rounded-xl border border-border bg-card p-4",
        "[transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]",
        "transition-[background-color,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-foreground/20",
        "[animation:ops-rise_550ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:[animation:none]",
        className,
      )}
      style={{ animationDelay: `${80 + index * 55}ms` }}
    >
      {children}
    </div>
  )
}

function Label({ icon: Icon, children }: { icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.09em] text-muted-foreground/70">
      {Icon ? <Icon className="size-3" strokeWidth={2} aria-hidden /> : null}
      {children}
    </span>
  )
}

function LiveDot({ size = 7 }: { size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-primary [animation:ops-ping_2.4s_ease-out_infinite] motion-reduce:[animation:none]"
      />
      <span aria-hidden className="absolute inset-[1px] rounded-full bg-primary" />
    </span>
  )
}

function Sparkline() {
  const top = Math.max(...TREND)
  const base = Math.min(...TREND)
  const stride = 100 / (TREND.length - 1)
  const points = TREND.map((value, i) => [i * stride, 100 - ((value - base) / (top - base)) * 86 - 4] as const)
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ")
  const area = `${line} L100,100 L0,100 Z`
  const [lastX, lastY] = points[points.length - 1]!

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className="h-full w-full overflow-visible">
      <path d={area} fill="var(--color-primary)" opacity={0.08} />
      <path
        d={line}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray="1 1"
        className="[animation:ops-draw_1200ms_cubic-bezier(0.22,1,0.36,1)_350ms_both] motion-reduce:[animation:none]"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r={2.6}
        fill="var(--color-primary)"
        className="[animation:ops-breathe_2.8s_ease-in-out_1450ms_infinite] motion-reduce:[animation:none]"
      />
    </svg>
  )
}

function Ring({ pct }: { pct: number }) {
  const share = Math.min(1, Math.max(0, pct / 100))
  return (
    <svg viewBox="0 0 88 88" className="size-[5.5rem]" role="img" aria-label={`${pct}% uptime`}>
      <circle cx={44} cy={44} r={34} fill="none" stroke="var(--color-border)" strokeWidth={5} />
      <circle
        cx={44}
        cy={44}
        r={34}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={5}
        strokeLinecap="round"
        transform="rotate(-90 44 44)"
        pathLength={1}
        strokeDasharray={`${share} 1`}
        className="[animation:ops-draw_1250ms_cubic-bezier(0.22,1,0.36,1)_300ms_both] motion-reduce:[animation:none]"
      />
      <text x={44} y={42} textAnchor="middle" fill="currentColor" fontSize={14} fontWeight={600}>
        {pct}%
      </text>
      <text x={44} y={55} textAnchor="middle" fill="currentColor" fontSize={7} opacity={0.45} letterSpacing={0.5}>
        ONLINE
      </text>
    </svg>
  )
}
