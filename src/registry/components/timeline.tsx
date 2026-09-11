"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export interface TimelineEntry {
  title: string
  date: string
  description: string
  status?: "done" | "current" | "upcoming"
}

export function Timeline({ entries, className }: { entries: TimelineEntry[]; className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-xl px-6 py-10", className)}>
      <div className="absolute left-[2.15rem] top-12 bottom-12 w-px bg-gradient-to-b from-white/25 via-white/10 to-transparent" />
      <ol className="space-y-8">
        {entries.map((entry, i) => (
          <motion.li
            key={entry.title}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="relative flex gap-5"
          >
            <span
              className={cn(
                "relative z-10 mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",
                entry.status === "done" && "border-emerald-400/40 bg-emerald-400/20",
                entry.status === "current" && "border-white/60 bg-white",
                (!entry.status || entry.status === "upcoming") && "border-white/20 bg-zinc-900"
              )}
            >
              {entry.status === "current" && (
                <span className="absolute size-5 animate-ping rounded-full bg-white/40" />
              )}
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  entry.status === "done" ? "bg-emerald-400" : entry.status === "current" ? "bg-black" : "bg-white/30"
                )}
              />
            </span>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h3 className="text-[15px] font-medium text-white">{entry.title}</h3>
                <span className="font-mono text-xs text-white/30">{entry.date}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-white/45">{entry.description}</p>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
