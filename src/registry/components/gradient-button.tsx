"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface GradientButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "default" | "variant"
}

export function GradientButton({
  className,
  variant = "default",
  children,
  ...props
}: GradientButtonProps) {
  return (
    <button
      className={cn(
        "relative inline-flex h-11 items-center justify-center rounded-[11px] px-8 text-sm font-medium text-white",
        "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        "before:absolute before:inset-0 before:rounded-[11px] before:p-[1.5px] before:content-['']",
        "before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:exclude]",
        variant === "default"
          ? "bg-[#0b0b0f] before:bg-[conic-gradient(from_var(--angle),#8b5cf6,#22d3ee,#f472b6,#8b5cf6)]"
          : "bg-[#0b0b0f] before:bg-[conic-gradient(from_var(--angle),#f59e0b,#ef4444,#f59e0b)]",
        "animate-[rotate-angle_4s_linear_infinite]",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <style>{`
        @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
        @keyframes rotate-angle { to { --angle: 360deg; } }
      `}</style>
    </button>
  )
}
