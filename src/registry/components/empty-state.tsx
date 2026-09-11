"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  secondaryAction?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed border-white/12 px-8 py-14 text-center",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(220px circle at center, black, transparent)",
        }}
      />
      {icon && (
        <div className="relative mb-1 flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60">
          {icon}
        </div>
      )}
      <h3 className="relative text-base font-semibold text-white">{title}</h3>
      {description && (
        <p className="relative max-w-sm text-sm leading-relaxed text-white/40">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="relative mt-3 flex items-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}
