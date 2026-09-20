"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function shot(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=480&h=600&fit=crop&q=70&auto=format`
}

export const WALL_IMAGES: string[] = [
  shot("1470071459604-3b5ec3a7fe05"),
  shot("1441974231531-c6227db76b6e"),
  shot("1500530855697-b586d89ba3ee"),
  shot("1506744038136-46273834b3fb"),
  shot("1418065460487-3e41a6c84dc5"),
  shot("1433086966358-54859d0ed716"),
  shot("1501785888041-af3ef285b470"),
  shot("1472214103451-9374bd1c798e"),
  shot("1505765050516-f72dcac9c60e"),
  shot("1447752875215-b2761acb3c5d"),
  shot("1426604966848-d7adac402bff"),
  shot("1444927714506-8492d94b4e3d"),
]

/** Column count is fixed so each one can own a lane of the wall. */
const LANES = 4

/**
 * A wall of images laid back in space, with each column drifting on its own
 * clock — the backdrop behind a hero rather than something to read.
 *
 * One plane is rotated and every column rides on it, so perspective is applied
 * once at the top. Rotating each column separately would give each its own
 * vanishing point and the wall would visibly bend.
 *
 * Each lane holds its list twice and travels exactly half its own height, which
 * is the only offset that loops seamlessly whatever the images turn out to be.
 * Animating to a fixed pixel distance leaves a jump the moment the content
 * changes.
 */
export function DepthMarquee({
  images = WALL_IMAGES,
  /** Seconds for a lane to travel its own length. Lanes vary around this. */
  speedSeconds = 26,
  className,
  children,
}: {
  images?: string[]
  speedSeconds?: number
  className?: string
  children?: React.ReactNode
}) {
  // Deal the images round-robin so neighbouring lanes never line up.
  const lanes = React.useMemo(() => {
    const out: string[][] = Array.from({ length: LANES }, () => [])
    images.forEach((src, i) => out[i % LANES]!.push(src))
    return out
  }, [images])

  return (
    <section
      className={cn(
        "relative flex min-h-[560px] w-full items-center justify-center overflow-hidden bg-background text-foreground",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [perspective:1100px] [perspective-origin:50%_50%]"
      >
        <div
          className={cn(
            // No `-translate-x-1/2` here: Tailwind writes that to the separate
            // `translate` property, which stacks with the `transform` below and
            // centres the wall twice over.
            "absolute left-1/2 top-1/2 flex h-[160%] w-[150%] gap-4",
            // One rotation for the whole wall: a single vanishing point.
            "[transform:translate(-50%,-50%)_rotateX(52deg)_rotateZ(-38deg)] [transform-style:preserve-3d]",
            "[mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent_75%)]",
          )}
        >
          {lanes.map((lane, i) => (
            <div key={i} className="flex-1 overflow-hidden">
              <div
                className={cn(
                  "flex flex-col gap-4 will-change-transform",
                  i % 2 === 0
                    ? "[animation:wall-up_var(--dur)_linear_infinite]"
                    : "[animation:wall-down_var(--dur)_linear_infinite]",
                  "motion-reduce:[animation:none]",
                )}
                style={{ ["--dur" as string]: `${speedSeconds + i * 5}s` }}
              >
                {/* Twice through, so half a cycle lands exactly on a repeat. */}
                {[0, 1].map((copy) =>
                  lane.map((src) => (
                    <img
                      key={`${copy}-${src}`}
                      src={src}
                      alt=""
                      // Eager: inside a rotated, masked plane the browser may
                      // never judge these on-screen, and lazy ones never load.
                      loading="eager"
                      draggable={false}
                      className="aspect-[4/5] w-full rounded-xl border border-border object-cover opacity-70"
                    />
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-background/45" />

      <div className="relative z-10 px-6 text-center">{children}</div>

      <style>{`
        @keyframes wall-up { to { transform: translateY(-50%) } }
        @keyframes wall-down { from { transform: translateY(-50%) } }
      `}</style>
    </section>
  )
}
