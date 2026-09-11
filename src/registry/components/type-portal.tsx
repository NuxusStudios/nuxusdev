"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Scroll through a letter into whatever comes next.
 *
 * The word is an SVG clip path over a full-bleed scene. As you scroll, the clip
 * scales up around one chosen letter until that letter's counter fills the
 * frame and the scene is simply visible — the reveal is the zoom, there is no
 * crossfade.
 *
 * Letter geometry comes from SVG's own text metrics (getExtentOfChar), so no
 * canvas, no pixel scanning and no font-loading dance: whatever face the
 * browser resolved is the one we measure.
 */
export function TypePortal({
  word = "PORTAL",
  focusIndex,
  scrollLength = 2.5,
  children,
  scene,
  caption = "Scroll to enter",
  className,
}: {
  word?: string
  /** which letter to travel through; defaults to the widest one */
  focusIndex?: number
  /** travel distance in viewport heights, 1–8 */
  scrollLength?: number
  /** what waits on the other side */
  children?: React.ReactNode
  /** what fills the letter as it opens; defaults to a themed gradient */
  scene?: React.ReactNode
  caption?: string
  className?: string
}) {
  const sectionRef = React.useRef<HTMLElement>(null)
  const textRef = React.useRef<SVGTextElement>(null)
  const sceneRef = React.useRef<HTMLDivElement>(null)
  const captionRef = React.useRef<HTMLDivElement>(null)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const letters = React.useMemo(() => Array.from(word), [word])
  const travel = Math.min(Math.max(scrollLength, 1), 8)
  const reduced = useReducedMotion()

  React.useEffect(() => {
    const section = sectionRef.current
    const text = textRef.current
    const scene = sceneRef.current
    if (!section || !text || !scene) return

    // reduced motion gets the destination, not the journey
    if (reduced) {
      scene.style.clipPath = "none"
      scene.style.opacity = "1"
      if (captionRef.current) captionRef.current.style.opacity = "0"
      if (contentRef.current) contentRef.current.style.opacity = "1"
      return
    }

    let frame = 0
    let letter: { x: number; y: number; height: number } | null = null
    let wordBox: { x: number; y: number; width: number; height: number } | null = null

    /** Where the chosen letter sits, in the SVG's own user units. */
    function measure() {
      if (!text) return
      const count = text.getNumberOfChars()
      if (count === 0) return

      let index = focusIndex ?? -1
      if (index < 0 || index >= count) {
        // widest letter: the most room to fly through
        let widest = 0
        for (let i = 0; i < count; i++) {
          const box = text.getExtentOfChar(i)
          if (box.width > widest) {
            widest = box.width
            index = i
          }
        }
      }

      const box = text.getExtentOfChar(index)
      letter = { x: box.x + box.width / 2, y: box.y + box.height / 2, height: box.height }

      // the word's own box: where the camera starts, before it moves in
      const whole = text.getBBox()
      wordBox = { x: whole.x, y: whole.y, width: whole.width, height: whole.height }
    }

    function draw() {
      frame = 0
      if (!section || !text || !scene || !letter || !wordBox) return

      const rect = section.getBoundingClientRect()
      const distance = rect.height - window.innerHeight
      const progress = distance <= 0 ? 0 : clamp(-rect.top / distance)

      // ease the zoom so it accelerates away rather than crawling linearly
      const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2

      const view = { w: window.innerWidth, h: window.innerHeight }

      // start with the whole word framed, end with the letter's counter filling
      // the screen; interpolating in log space keeps the zoom feeling even
      const start = (view.w * 0.86) / wordBox.width
      const end = Math.hypot(view.w, view.h) / (letter.height * 0.2)
      const scale = Math.exp(Math.log(start) + Math.log(end / start) * eased)

      // and travel from the word's centre to the letter's as it grows, so the
      // word reads properly before the camera commits to one letter
      const from = { x: wordBox.x + wordBox.width / 2, y: wordBox.y + wordBox.height / 2 }
      const fx = from.x + (letter.x - from.x) * eased
      const fy = from.y + (letter.y - from.y) * eased

      text.setAttribute(
        "transform",
        `translate(${view.w / 2 - fx * scale} ${view.h / 2 - fy * scale}) scale(${scale})`
      )

      // once the letter is bigger than the frame the clip only costs paint time
      scene.style.clipPath = progress >= 0.995 ? "none" : "url(#type-portal-clip)"

      if (captionRef.current) captionRef.current.style.opacity = String(1 - clamp(progress / 0.12))
      if (contentRef.current) {
        contentRef.current.style.opacity = String(clamp((progress - 0.72) / 0.22))
      }
    }

    const schedule = () => {
      frame ||= requestAnimationFrame(draw)
    }

    const relayout = () => {
      measure()
      schedule()
    }

    relayout()

    // fonts land after first paint and change every measurement
    document.fonts?.ready.then(relayout).catch(() => {})

    const observer = new ResizeObserver(relayout)
    observer.observe(section)
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", relayout)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", relayout)
    }
  }, [word, focusIndex, reduced])

  return (
    <section
      ref={sectionRef}
      className={cn("relative w-full bg-background", className)}
      style={{ height: reduced ? "auto" : `${travel * 100}vh` }}
      aria-label={word}
    >
      <div
        className={cn(
          "top-0 h-screen w-full overflow-hidden",
          reduced ? "relative h-auto" : "sticky"
        )}
      >
        <svg className="pointer-events-none absolute size-0" aria-hidden>
          <defs>
            <clipPath id="type-portal-clip" clipPathUnits="userSpaceOnUse">
              <text
                ref={textRef}
                x="0"
                y="0"
                textAnchor="start"
                dominantBaseline="middle"
                style={{
                  fontSize: 100,
                  fontWeight: 900,
                  fontKerning: "none",
                  letterSpacing: "-0.03em",
                }}
              >
                {word}
              </text>
            </clipPath>
          </defs>
        </svg>

        {/* the scene, revealed by the growing letter */}
        <div
          ref={sceneRef}
          className="absolute inset-0"
          style={{ clipPath: "url(#type-portal-clip)" }}
          aria-hidden
        >
          {scene ?? (
            <div className="size-full [background:radial-gradient(120%_90%_at_20%_10%,var(--color-primary),transparent_55%),radial-gradient(100%_80%_at_85%_80%,var(--color-accent),transparent_60%),linear-gradient(140deg,var(--color-card),var(--color-background))]" />
          )}
        </div>

        {/* the word as readable type, for anyone the clip never reaches */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="sr-only">{word}</span>
          <span aria-hidden className="flex gap-[0.02em] text-transparent">
            {letters.map((letter, i) => (
              <span key={i} className="text-[18vw] font-black leading-none tracking-tighter">
                {letter}
              </span>
            ))}
          </span>
        </div>

        <div
          ref={captionRef}
          className="absolute inset-x-0 bottom-[8%] flex justify-center text-[13px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
        >
          {caption}
        </div>

        <div
          ref={contentRef}
          className="absolute inset-0 grid place-content-center px-8 opacity-0"
          style={{ color: "var(--color-primary-foreground)" }}
        >
          {children ?? (
            <div className="max-w-2xl text-center">
              <h2 className="text-4xl font-semibold tracking-tight">A letter becomes a place.</h2>
              <p className="mt-4 text-lg opacity-80">
                Whatever comes next starts on the other side of the type.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n))
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

export default TypePortal
