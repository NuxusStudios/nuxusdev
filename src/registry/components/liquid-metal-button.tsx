"use client"

import * as React from "react"
import { Sparkles } from "lucide-react"
import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders"
import { cn } from "@/lib/utils"

/**
 * A button whose face is a live liquid-metal shader.
 *
 * The shader runs at a slow idle and speeds up on hover and on press, so the
 * surface reacts rather than just looping. When the reader has asked for
 * reduced motion it is mounted once and left still.
 */
export function LiquidMetalButton({
  label = "Get started",
  iconOnly = false,
  onClick,
  className,
}: {
  label?: string
  /** render a square icon button instead of a labelled one */
  iconOnly?: boolean
  onClick?: () => void
  className?: string
}) {
  const [hovered, setHovered] = React.useState(false)
  const [pressed, setPressed] = React.useState(false)
  const shaderHost = React.useRef<HTMLDivElement>(null)
  const mount = React.useRef<{ setSpeed?: (n: number) => void; dispose?: () => void } | null>(null)

  const size = iconOnly ? { width: 46, height: 46 } : { width: 148, height: 46 }
  const reduced = useReducedMotion()

  React.useEffect(() => {
    const host = shaderHost.current
    if (!host) return

    // a still first frame is the whole point when motion is unwelcome
    const idle = reduced ? 0 : 0.6

    const instance = new ShaderMount(
      host,
      liquidMetalFragmentShader,
      {
        u_repetition: 4,
        u_softness: 0.5,
        u_shiftRed: 0.3,
        u_shiftBlue: 0.3,
        u_distortion: 0,
        u_contour: 0,
        u_angle: 45,
        u_scale: 8,
        u_shape: 1,
        u_offsetX: 0.1,
        u_offsetY: -0.1,
      },
      undefined,
      idle
    ) as unknown as { setSpeed?: (n: number) => void; dispose?: () => void }

    mount.current = instance
    return () => {
      instance.dispose?.()
      mount.current = null
    }
  }, [reduced])

  function speed(value: number) {
    if (reduced) return
    mount.current?.setSpeed?.(value)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() => {
        setHovered(true)
        speed(1)
      }}
      onPointerLeave={() => {
        setHovered(false)
        setPressed(false)
        speed(0.6)
      }}
      onPointerDown={() => {
        setPressed(true)
        speed(2.4)
      }}
      onPointerUp={() => {
        setPressed(false)
        speed(hovered ? 1 : 0.6)
      }}
      aria-label={iconOnly ? label : undefined}
      style={{ width: size.width, height: size.height }}
      className={cn(
        "group relative isolate overflow-hidden rounded-full border border-border",
        "transition-transform duration-150 active:translate-y-px",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none",
        className
      )}
    >
      {/* the shader canvas is stretched to fill and sits behind everything */}
      <div
        ref={shaderHost}
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full [&_canvas]:absolute [&_canvas]:inset-0 [&_canvas]:block [&_canvas]:size-full [&_canvas]:rounded-full"
      />

      <span
        aria-hidden
        className={cn(
          "absolute inset-px -z-10 rounded-full bg-background/85 transition-opacity duration-200",
          pressed ? "opacity-95" : hovered ? "opacity-70" : "opacity-85"
        )}
      />

      <span className="relative flex items-center justify-center gap-1.5 text-sm font-medium text-foreground">
        {iconOnly ? <Sparkles className="size-4" /> : label}
      </span>
    </button>
  )
}

function useReducedMotion(): boolean {
  return React.useSyncExternalStore(
    (callback) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)")
      query.addEventListener("change", callback)
      return () => query.removeEventListener("change", callback)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
}

export default LiquidMetalButton
