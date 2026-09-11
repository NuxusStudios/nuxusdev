"use client"

import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BentoItem {
  name: string
  description: string
  icon: ReactNode
  href?: string
  cta?: string
  background?: ReactNode
  className?: string
}

export function BentoGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid w-full auto-rows-[16rem] grid-cols-3 gap-4", className)}>
      {children}
    </div>
  )
}

export function BentoCard({ name, description, icon, cta = "Learn more", background, className }: BentoItem) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl",
        "bg-white/[0.03] border border-white/10",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset] transition-colors hover:border-white/20",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0">{background}</div>
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-8">
        <div className="mb-2 flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <p className="max-w-[22ch] text-sm text-white/50">{description}</p>
      </div>
      <div className="absolute bottom-0 flex w-full translate-y-8 transform-gpu flex-row items-center p-5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <button className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
          {cta} <ArrowRight className="size-4" />
        </button>
      </div>
      <div className="pointer-events-none absolute inset-0 transition-all duration-300 group-hover:bg-white/[0.02]" />
    </div>
  )
}
