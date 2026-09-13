"use client"

import * as React from "react"
import {
  Aperture,
  Boxes,
  Compass,
  Hexagon,
  Orbit,
  Radar,
  Triangle,
  Waves,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface CloudLogo {
  name: string
  icon: LucideIcon
}

export const CLOUD_LOGOS: CloudLogo[] = [
  { name: "Northwind", icon: Waves },
  { name: "Hexial", icon: Hexagon },
  { name: "Apertura", icon: Aperture },
  { name: "Orbit Labs", icon: Orbit },
  { name: "Compass", icon: Compass },
  { name: "Boxwork", icon: Boxes },
  { name: "Radarline", icon: Radar },
  { name: "Delta Nine", icon: Triangle },
]

/**
 * A logo wall that scrolls forever, under a heading that resolves word by word.
 *
 * The track is the list rendered twice and translated by exactly half its own
 * width, which is the only version of this that loops seamlessly at any content
 * width — animating to a fixed pixel offset leaves a visible jump the moment
 * the logos change.
 *
 * The soft edges are a `mask-image`, not a pair of gradient overlays fading to
 * the page colour. Overlays only disappear on the background they were written
 * for; a mask cuts the alpha, so this section drops onto any backdrop.
 */
export function LogoCloud({
  title = "Built on the stack our customers already run",
  description = "Teams shipping with Nuxus sit alongside the tools their engineers picked first.",
  logos = CLOUD_LOGOS,
  /** Seconds for one full pass of the track. */
  speedSeconds = 34,
  className,
}: {
  title?: string
  description?: string
  logos?: CloudLogo[]
  speedSeconds?: number
  className?: string
}) {
  const words = title.split(" ")
  const [shown, setShown] = React.useState(false)
  const hostRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // One-shot: the heading resolves once and stays resolved.
          if (entry.isIntersecting) {
            setShown(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={hostRef}
      className={cn("relative w-full overflow-hidden bg-background py-20 text-foreground", className)}
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-bold tracking-tight md:text-5xl">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="mr-[0.28em] inline-block transition-[opacity,filter,transform] duration-500 ease-out motion-reduce:transition-none"
              style={{
                opacity: shown ? 1 : 0,
                filter: shown ? "blur(0px)" : "blur(6px)",
                transform: shown ? "translateY(0)" : "translateY(12px)",
                transitionDelay: `${i * 70}ms`,
              }}
            >
              {word}
            </span>
          ))}
        </h2>

        {description ? (
          <p
            className="mx-auto mt-6 max-w-xl text-center text-base leading-relaxed text-muted-foreground transition-opacity duration-500 md:text-lg motion-reduce:transition-none"
            style={{ opacity: shown ? 1 : 0, transitionDelay: "380ms" }}
          >
            {description}
          </p>
        ) : null}

        <div
          className={cn(
            "group relative mt-14 flex overflow-hidden",
            "[--gap:3.5rem] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
          )}
          style={{ gap: "var(--gap)" }}
        >
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className={cn(
                "flex shrink-0 items-center justify-around [gap:var(--gap)]",
                "[animation:logo-cloud-drift_var(--speed)_linear_infinite]",
                "group-hover:[animation-play-state:paused] motion-reduce:[animation:none]",
              )}
              style={{ ["--speed" as string]: `${speedSeconds}s` }}
            >
              {logos.map(({ name, icon: Icon }) => (
                <div
                  key={name}
                  className="flex shrink-0 items-center gap-2.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Icon className="size-6 shrink-0" strokeWidth={1.5} aria-hidden />
                  <span className="whitespace-nowrap text-lg font-semibold tracking-tight">{name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes logo-cloud-drift {
          from { transform: translateX(0) }
          to { transform: translateX(calc(-100% - var(--gap))) }
        }
      `}</style>
    </section>
  )
}
