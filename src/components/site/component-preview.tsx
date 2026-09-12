"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { previewQuery, useBrandPreview } from "@/components/site/brand-preview-context"

/**
 * Renders a registry demo inside an isolated iframe so a component's own CSS,
 * fonts and animations can't leak into the page around it.
 *
 * The iframe is laid out at `frameWidth` and scaled down to whatever space the
 * card gives it, which keeps every preview at a consistent "desktop" breakpoint.
 * It only mounts once it scrolls into view.
 */
export function ComponentPreview({
  previewKey,
  frameWidth = 1200,
  aspect = 4 / 3,
  className,
  interactive = false,
  eager = false,
}: {
  previewKey: string
  frameWidth?: number
  aspect?: number
  className?: string
  interactive?: boolean
  eager?: boolean
}) {
  const { theme } = useBrandPreview()
  const coarsePointer = useCoarsePointer()
  const hostRef = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  const [visible, setVisible] = React.useState(eager)
  // tracks which theme the loaded frame belongs to, so switching themes fades
  // the new frame in rather than showing a blank one at full opacity
  const [loadedTheme, setLoadedTheme] = React.useState<string | null>(null)

  React.useEffect(() => {
    const el = hostRef.current
    if (!el) return

    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    setWidth(el.getBoundingClientRect().width)

    if (visible) return () => ro.disconnect()

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin: "400px" }
    )
    io.observe(el)

    return () => {
      ro.disconnect()
      io.disconnect()
    }
  }, [visible])

  const scrollable = interactive && !coarsePointer
  const themeKey = theme ?? "default"
  const loaded = loadedTheme === themeKey
  const scale = width ? width / frameWidth : 0
  const frameHeight = Math.round(frameWidth / aspect)

  return (
    <div
      ref={hostRef}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border bg-card",
        className
      )}
      style={{ aspectRatio: String(aspect) }}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary/60 to-secondary/20" />
      )}

      {visible && scale > 0 && (
        <iframe
          // the key forces a remount when the theme changes, so the iframe
          // reloads instead of keeping the old render
          key={themeKey}
          src={`/preview/${previewKey}${previewQuery(theme)}`}
          title={`${previewKey} preview`}
          loading="lazy"
          onLoad={() => setLoadedTheme(themeKey)}
          // Scrollable only when interactive AND there is a real pointer.
          // A grid of cards must stay locked or the wheel gets eaten by
          // whichever preview happens to be under the cursor, while the one on
          // a detail page has to scroll or its "scroll to continue" hint is a
          // lie. On a touch screen it stays locked either way: a scrollable
          // iframe with contained overscroll is a trap you cannot swipe past,
          // which is why the full-screen link below exists.
          scrolling={scrollable ? "yes" : "no"}
          tabIndex={interactive ? 0 : -1}
          className={cn(
            "absolute left-0 top-0 origin-top-left border-0 bg-background transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
            !interactive && "pointer-events-none"
          )}
          style={{
            width: frameWidth,
            height: frameHeight,
            transform: `scale(${scale})`,
          }}
        />
      )}

      {interactive && (
        <a
          href={`/preview/${previewKey}${previewQuery(theme)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "absolute bottom-3 right-3 z-10 rounded-lg border border-border bg-background/80 px-2.5 py-1.5",
            "text-[12px] text-muted-foreground backdrop-blur transition-colors",
            "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          Open full preview ↗
        </a>
      )}
    </div>
  )
}

/** Touch screens report a coarse pointer; mice and trackpads report fine. */
function useCoarsePointer(): boolean {
  return React.useSyncExternalStore(
    (callback) => {
      const query = window.matchMedia("(pointer: coarse)")
      query.addEventListener("change", callback)
      return () => query.removeEventListener("change", callback)
    },
    () => window.matchMedia("(pointer: coarse)").matches,
    () => false
  )
}
