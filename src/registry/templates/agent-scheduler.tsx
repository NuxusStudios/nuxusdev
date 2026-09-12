"use client"

import * as React from "react"
import {
  Bell, Calendar, ChevronRight, Clock, Cpu, Gauge, Inbox, PanelsTopLeft,
  ShieldCheck, Star, Timer, Webhook, Zap,
} from "lucide-react"
import { NumberTicker } from "@/registry/components/number-ticker"
import { StatusBadge, type StatusTone } from "@/registry/components/status-badge"
import { cn } from "@/lib/utils"

/**
 * The console for scheduled autonomous work.
 *
 * Everything a scheduler has to answer is on one screen: what is queued, what
 * is running, what it is allowed to spend, and what is waiting on a person.
 * Built from theme tokens, so it arrives in the project's palette.
 */

type Trigger = "cron" | "webhook" | "event" | "agent"

const TRIGGER: Record<Trigger, { label: string; icon: typeof Clock }> = {
  cron: { label: "Cron", icon: Clock },
  webhook: { label: "Webhook", icon: Webhook },
  event: { label: "Event", icon: Zap },
  agent: { label: "Agent-set", icon: Cpu },
}

interface Job {
  name: string
  trigger: Trigger
  detail: string
  steps: string[]
  tone: StatusTone
  day: number
}

const JOBS: Job[] = [
  { name: "Daily intelligence", trigger: "cron", detail: "08:30", steps: ["Research", "Brief"], tone: "operational", day: 0 },
  { name: "Lead response", trigger: "webhook", detail: "On form submit", steps: ["Enrich", "Qualify"], tone: "operational", day: 0 },
  { name: "Customer health", trigger: "cron", detail: "Hourly", steps: ["Score", "Review", "Escalate"], tone: "degraded", day: 1 },
  { name: "Research crew", trigger: "agent", detail: "Adaptive", steps: ["Gather", "Synthesise"], tone: "operational", day: 2 },
  { name: "Invoice follow-up", trigger: "event", detail: "On overdue", steps: ["Review", "Send"], tone: "operational", day: 3 },
  { name: "Pipeline review", trigger: "cron", detail: "Fridays", steps: ["Collect", "Rank"], tone: "operational", day: 4 },
  // Sunday is deliberately empty, so the board ships with its empty state visible
  { name: "Memory maintenance", trigger: "agent", detail: "Saturdays, 02:00", steps: ["Summarise", "Persist"], tone: "maintenance", day: 5 },
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const GUARDRAILS: { name: string; why: string; mode: "Enforce" | "Approve" | "Monitor" }[] = [
  { name: "Daily model budget", why: "Stops runaway spend", mode: "Enforce" },
  { name: "Run timeout", why: "Ends stalled jobs", mode: "Enforce" },
  { name: "Destructive tools", why: "Refunds, deletes, sends", mode: "Approve" },
  { name: "Retry ceiling", why: "Breaks error loops", mode: "Monitor" },
  { name: "Concurrency", why: "One run per schedule", mode: "Enforce" },
  { name: "Tool allowlist", why: "Only approved tools", mode: "Approve" },
]

const INBOX = [
  { title: "Research brief ready", body: "Research agent finished the competitor scan.", when: "8m", tone: "operational" as StatusTone },
  { title: "Approval required", body: "Support agent wants to issue a refund of £240.", when: "1h", tone: "degraded" as StatusTone },
  { title: "Budget threshold reached", body: "Finance agent paused the nightly run at 80%.", when: "4h", tone: "degraded" as StatusTone },
  { title: "Memory sync complete", body: "Ops agent stored context for its next wake-up.", when: "1d", tone: "operational" as StatusTone },
]

const ASSIGNEES = [
  { id: "RS", load: 178 }, { id: "SP", load: 164 }, { id: "FN", load: 141 },
  { id: "OP", load: 128 }, { id: "QA", load: 96 }, { id: "DV", load: 74 },
  { id: "ML", load: 61 }, { id: "BK", load: 44 },
]

const PROJECTS = [
  { project: "Daily intelligence", runs: 239, ok: 236, review: 3 },
  { project: "Lead response", runs: 181, ok: 176, review: 5 },
  { project: "Customer health", runs: 95, ok: 88, review: 7 },
  { project: "Support queue", runs: 88, ok: 88, review: 0 },
  { project: "Research crew", runs: 72, ok: 70, review: 2 },
  { project: "Invoice follow-up", runs: 51, ok: 51, review: 0 },
]

const NAV = [
  { label: "Inbox", icon: Inbox, badge: 4 },
  { label: "Schedules", icon: Calendar, active: true },
  { label: "Agents", icon: Cpu },
  { label: "Run history", icon: Timer },
  { label: "Insights", icon: Gauge },
  { label: "Guardrails", icon: ShieldCheck },
]

export default function AgentSchedulerTemplate() {
  const [day, setDay] = React.useState(0)
  const visible = JOBS.filter((job) => job.day === day)
  const peak = Math.max(...ASSIGNEES.map((a) => a.load))

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-border lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <PanelsTopLeft className="size-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">Orchestra</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <a
                key={item.label}
                href="#"
                aria-current={item.active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition-colors",
                  item.active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-primary/15 px-1.5 text-[11px] tabular-nums text-primary">
                    {item.badge}
                  </span>
                )}
              </a>
            )
          })}

          <p className="px-2.5 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
            Favourites
          </p>
          {["Daily briefing", "Research crew", "Budget watch"].map((item) => (
            <a
              key={item}
              href="#"
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <Star className="size-3.5" />
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-5">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">Schedules</h1>
            <p className="truncate text-[12px] text-muted-foreground">
              12 queued over the next seven days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone="operational" label="Mesh healthy" pulse />
            <button className="rounded-lg bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              New schedule
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 space-y-5 p-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Runs today", value: 1249, suffix: "" },
              { label: "Success rate", value: 99.9, suffix: "%", decimals: 1 },
              { label: "Median handoff", value: 342, suffix: "ms" },
              { label: "Awaiting review", value: 4, suffix: "" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-[12px] text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  <NumberTicker value={stat.value} decimalPlaces={stat.decimals ?? 0} />
                  {stat.suffix}
                </p>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
              <h2 className="text-[13px] font-semibold">This week</h2>
              {/* a real day picker rather than a static strip — the point of the
                  board is seeing what a given day actually holds */}
              <div className="flex gap-1" role="tablist" aria-label="Day of week">
                {DAYS.map((label, index) => {
                  const count = JOBS.filter((job) => job.day === index).length
                  return (
                    <button
                      key={label}
                      role="tab"
                      aria-selected={day === index}
                      onClick={() => setDay(index)}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-[12px] transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        day === index
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      {label}
                      {count > 0 && <span className="ml-1 tabular-nums opacity-70">{count}</span>}
                    </button>
                  )
                })}
              </div>
            </div>

            <ul className="divide-y divide-border">
              {visible.length === 0 ? (
                <li className="px-4 py-10 text-center text-[13px] text-muted-foreground">
                  Nothing scheduled on {DAYS[day]}.
                </li>
              ) : (
                visible.map((job) => {
                  const Icon = TRIGGER[job.trigger].icon
                  return (
                    <li key={job.name} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <Icon className="size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">{job.name}</p>
                        <p className="truncate text-[12px] text-muted-foreground">
                          {TRIGGER[job.trigger].label} · {job.detail}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {job.steps.map((step, i) => (
                          <React.Fragment key={step}>
                            {i > 0 && <ChevronRight className="size-3 text-muted-foreground/50" />}
                            <span className="rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                              {step}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                      <StatusBadge tone={job.tone} />
                    </li>
                  )
                })
              )}
            </ul>
          </section>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <section className="min-w-0 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-[13px] font-semibold">Guardrails</h2>
                <span className="text-[12px] text-muted-foreground">6 active</span>
              </div>
              <ul className="divide-y divide-border">
                {GUARDRAILS.map((rule) => (
                  <li key={rule.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px]">{rule.name}</p>
                      <p className="truncate text-[12px] text-muted-foreground">{rule.why}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-md border px-1.5 py-0.5 text-[11px]",
                        rule.mode === "Approve"
                          ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      {rule.mode}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-border px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[12px] text-muted-foreground">Today&apos;s budget</p>
                  <p className="text-[13px] tabular-nums">$6,844 / $10,000</p>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={68}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Daily budget used"
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: "68.4%" }} />
                </div>
              </div>
            </section>

            <section className="min-w-0 rounded-xl border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Bell className="size-3.5 text-muted-foreground" />
                <h2 className="text-[13px] font-semibold">Inbox</h2>
              </div>
              <ul className="divide-y divide-border">
                {INBOX.map((item) => (
                  <li key={item.title} className="flex gap-3 px-4 py-3">
                    <span className="mt-1.5 shrink-0">
                      <StatusBadge tone={item.tone} label="" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{item.title}</p>
                      <p className="text-[12px] leading-relaxed text-muted-foreground">{item.body}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{item.when}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-2">
            <section className="min-w-0 rounded-xl border border-border bg-card p-4">
              <h2 className="text-[13px] font-semibold">Load by agent</h2>
              <ul className="mt-4 flex h-40 items-end gap-2">
                {ASSIGNEES.map((a) => (
                  <li key={a.id} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-t bg-primary/70"
                      style={{ height: `${(a.load / peak) * 100}%` }}
                      title={`${a.id}: ${a.load} runs`}
                    />
                    <span className="text-[10px] text-muted-foreground">{a.id}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="min-w-0 rounded-xl border border-border bg-card">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-[13px] font-semibold">By schedule</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[26rem] text-[13px]">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th scope="col" className="px-4 py-2 font-normal">Schedule</th>
                      <th scope="col" className="px-4 py-2 text-right font-normal">Runs</th>
                      <th scope="col" className="px-4 py-2 text-right font-normal">Clean</th>
                      <th scope="col" className="px-4 py-2 text-right font-normal">Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROJECTS.map((row) => (
                      <tr key={row.project} className="border-b border-border last:border-0">
                        <td className="truncate px-4 py-2">{row.project}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{row.runs}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{row.ok}</td>
                        <td className="px-4 py-2 text-right tabular-nums">
                          {row.review > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400">{row.review}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
