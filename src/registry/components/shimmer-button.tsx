"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ShimmerButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "0.05em",
      shimmerDuration = "3s",
      borderRadius = "100px",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            "--spread": "90deg",
            "--shimmer-color": shimmerColor,
            "--radius": borderRadius,
            "--speed": shimmerDuration,
            "--cut": shimmerSize,
            "--bg": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-foreground/10 px-6 py-3 text-foreground [background:var(--bg)] [border-radius:var(--radius)]",
          "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
          className
        )}
        {...props}
      >
        <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]">
          <div className="absolute inset-0 h-[100cqh] animate-[shimmer-slide_var(--speed)_ease-in-out_infinite_alternate] [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="absolute -inset-full w-auto rotate-0 animate-[spin-around_calc(var(--speed)*2)_infinite_linear] [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>
        <span className="relative text-sm font-medium">{children}</span>
        <div className="insert-0 absolute size-full transform-gpu transition-all duration-300 ease-in-out [border-radius:var(--radius)] group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]" />
        <div className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]" />
        <style>{`
          @keyframes shimmer-slide { to { transform: translate(calc(100cqw - 100%), 0); } }
          @keyframes spin-around {
            0% { transform: translateZ(0) rotate(0); }
            15%, 35% { transform: translateZ(0) rotate(90deg); }
            65%, 85% { transform: translateZ(0) rotate(270deg); }
            100% { transform: translateZ(0) rotate(360deg); }
          }
        `}</style>
      </button>
    )
  }
)
ShimmerButton.displayName = "ShimmerButton"
