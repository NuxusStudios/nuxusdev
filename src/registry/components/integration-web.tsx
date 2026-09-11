"use client"

import * as React from "react"
import { motion } from "motion/react"
import { Boxes, Cloud, Database, GitBranch, Layers, Workflow } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * A hub-and-spoke diagram with light travelling along each connection.
 *
 * The paths are drawn in a fixed 564×410 space and the nodes positioned as
 * percentages of it, so the whole thing scales without the lines drifting away
 * from the icons they connect.
 */
interface Node {
  id: string
  icon: React.ComponentType<{ className?: string }>
  x: number
  y: number
  path: string
  delay: number
}

const NODES: Node[] = [
  { id: "repos", icon: GitBranch, x: 110, y: 90, path: "M 270 205 V 105 Q 270 90 255 90 H 110", delay: 0.1 },
  { id: "cloud", icon: Cloud, x: 360, y: 70, path: "M 294 205 V 85 Q 294 70 309 70 H 360", delay: 0.2 },
  { id: "layers", icon: Layers, x: 160, y: 205, path: "M 250 205 H 160", delay: 0.3 },
  { id: "data", icon: Database, x: 480, y: 205, path: "M 314 205 H 480", delay: 0.4 },
  { id: "flows", icon: Workflow, x: 282, y: 360, path: "M 282 205 V 360", delay: 0.6 },
  { id: "packages", icon: Boxes, x: 460, y: 340, path: "M 314 215 V 325 Q 314 340 329 340 H 460", delay: 0.7 },
]

function Connection({ d, id, delay }: { d: string; id: string; delay: number }) {
  return (
    <>
      <path d={d} stroke="currentColor" strokeWidth="1" fill="none" className="text-border" />
      <motion.path
        d={d}
        stroke={`url(#${id})`}
        strokeWidth="2"
        fill="none"
        strokeDasharray="40 160"
        initial={{ strokeDashoffset: 200 }}
        animate={{ strokeDashoffset: -200 }}
        // a fixed per-node delay rather than Math.random, so the server and
        // client agree on the first frame
        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay }}
      />
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="transparent" />
          <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </>
  )
}

export function IntegrationWeb({
  hub,
  className,
}: {
  /** what sits at the centre; defaults to a generic mark */
  hub?: React.ReactNode
  className?: string
}) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "")

  return (
    <div className={cn("relative size-full", className)}>
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        viewBox="0 0 564 410"
        fill="none"
        aria-hidden
      >
        {NODES.map((node) => (
          <Connection key={node.id} d={node.path} id={`${uid}-${node.id}`} delay={node.delay} />
        ))}
      </svg>

      <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-background p-0.5 shadow-md sm:rounded-2xl sm:p-2 sm:shadow-xl">
        <div className="rounded-lg border p-1 sm:rounded-xl sm:p-2.5">
          {hub ?? <Boxes className="size-5 text-foreground sm:size-9" />}
        </div>
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-primary/20 sm:rounded-2xl motion-reduce:hidden"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      {NODES.map((node) => {
        const Icon = node.icon
        return (
          // Deliberately not animated in. An entrance animation here left the
          // nodes at opacity 0 whenever it failed to start — inside an iframe,
          // a clipped container, or a paused tab — and an invisible diagram is
          // a far worse failure than one that simply appears. The travelling
          // light on the connections carries the motion instead.
          <div
            key={node.id}
            style={{ left: `${(node.x / 564) * 100}%`, top: `${(node.y / 410) * 100}%` }}
            className="absolute z-10 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm sm:size-12 sm:rounded-xl"
          >
            <Icon className="size-4 sm:size-6" />
          </div>
        )
      })}
    </div>
  )
}

export function IntegrationCard({
  title,
  description,
  href,
  className,
}: {
  title: string
  description: string
  href?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-card sm:max-w-141",
        className
      )}
    >
      <div className="relative flex aspect-564/460 w-full items-center justify-center overflow-hidden bg-muted p-8 sm:aspect-564/410 dark:bg-muted/50">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-foreground) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/60 from-10% via-transparent to-background/60 to-90%" />
        <div className="relative z-10 flex size-full items-center justify-center">
          <IntegrationWeb />
        </div>
      </div>

      <div className="flex flex-col gap-6 p-6 sm:gap-8 sm:p-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-medium tracking-tight sm:text-2xl">{title}</h3>
          <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {href && (
          <a
            href={href}
            className={cn(
              "inline-flex h-10 w-fit items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors",
              "hover:bg-primary/90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            )}
          >
            Learn more
          </a>
        )}
      </div>
    </div>
  )
}

export default IntegrationCard
