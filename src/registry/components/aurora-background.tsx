"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function AuroraBackground({
  className,
  children,
  showRadialGradient = true,
}: {
  className?: string
  children?: ReactNode
  showRadialGradient?: boolean
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[420px] flex-col items-center justify-center bg-background text-foreground transition-bg",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          style={
            {
              "--aurora":
                "repeating-linear-gradient(100deg,#3b82f6 10%,#a5b4fc 15%,#93c5fd 20%,#ddd6fe 25%,#60a5fa 30%)",
              "--dark-gradient":
                "repeating-linear-gradient(100deg,#000 0%,#000 7%,transparent 10%,transparent 12%,#000 16%)",
            } as React.CSSProperties
          }
          className={cn(
            `pointer-events-none absolute -inset-[10px] opacity-40 blur-[10px] will-change-transform`,
            `[background-image:var(--dark-gradient),var(--aurora)]`,
            `[background-size:300%,_200%] [background-position:50%_50%,50%_50%]`,
            `after:absolute after:inset-0 after:[background-image:var(--dark-gradient),var(--aurora)]`,
            `after:[background-size:200%,_100%] after:mix-blend-difference after:content-[""]`,
            `after:animate-[aurora_60s_linear_infinite]`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
          )}
        />
      </div>
      <style>{`@keyframes aurora { from { background-position: 50% 50%, 50% 50%; } to { background-position: 350% 50%, 350% 50%; } }`}</style>
      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        {children}
      </div>
    </div>
  )
}
