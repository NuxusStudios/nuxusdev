"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=800&fit=crop&q=80&auto=format"

/**
 * Ordered (Bayer) threshold matrix, 8×8. Values are the classic recursive
 * construction, already normalised to 0–63.
 */
const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]

/**
 * A photograph run through an ordered dither, with a wipe to compare it against
 * the original.
 *
 * Ordered dithering is a per-pixel decision against a fixed matrix, so the
 * result is stable — the same picture always produces the same grain, and it
 * tiles without the drifting artefacts error-diffusion leaves behind.
 *
 * The pass runs once at a reduced resolution and is then scaled up with
 * smoothing off, which is what makes the dots read as dots. Dithering at full
 * size and shrinking would average the pattern straight back into grey.
 */
export function DitherImage({
  src = DEFAULT_IMAGE,
  alt = "",
  /** Size of one dithered dot, in CSS pixels. Larger is coarser. */
  dot = 3,
  /** Tones kept after thresholding. 2 is pure black and white. */
  levels = 2,
  /** Starting split, 0–100. */
  split = 55,
  className,
}: {
  src?: string
  alt?: string
  dot?: number
  levels?: number
  split?: number
  className?: string
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [wipe, setWipe] = React.useState(split)
  const [failed, setFailed] = React.useState(false)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false

    const image = new Image()
    // Required, or reading the pixels back throws on a cross-origin photo.
    image.crossOrigin = "anonymous"
    image.decoding = "async"

    image.onload = () => {
      if (disposed) return
      const grid = Math.max(1, dot)
      const w = Math.max(1, Math.round(image.naturalWidth / grid))
      const h = Math.max(1, Math.round(image.naturalHeight / grid))

      const small = document.createElement("canvas")
      small.width = w
      small.height = h
      const smallCtx = small.getContext("2d", { willReadFrequently: true })
      if (!smallCtx) return
      smallCtx.drawImage(image, 0, 0, w, h)

      let pixels: ImageData
      try {
        pixels = smallCtx.getImageData(0, 0, w, h)
      } catch {
        // Host refused CORS: show the photograph rather than an empty frame.
        setFailed(true)
        setReady(true)
        return
      }

      const data = pixels.data
      const steps = Math.max(2, Math.round(levels))
      const band = 255 / (steps - 1)

      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const at = (y * w + x) * 4
          // Rec. 601 luma: the eye weights green far above blue.
          const luma = data[at]! * 0.299 + data[at + 1]! * 0.587 + data[at + 2]! * 0.114
          const bias = (BAYER[y & 7]![x & 7]! / 64 - 0.5) * band
          const tone = Math.round(Math.min(255, Math.max(0, luma + bias)) / band) * band
          data[at] = tone
          data[at + 1] = tone
          data[at + 2] = tone
        }
      }

      smallCtx.putImageData(pixels, 0, 0)

      canvas.width = image.naturalWidth
      canvas.height = image.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      // Smoothing off is the whole point — this is what keeps the dots crisp.
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(small, 0, 0, canvas.width, canvas.height)
      setReady(true)
    }

    image.onerror = () => {
      if (!disposed) {
        setFailed(true)
        setReady(true)
      }
    }

    image.src = src
    return () => {
      disposed = true
      image.onload = null
      image.onerror = null
    }
  }, [dot, levels, src])

  return (
    <figure className={cn("relative w-full overflow-hidden rounded-xl bg-card", className)}>
      <img src={src} alt={alt} className="block h-full w-full object-cover" />

      {!failed ? (
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          style={{ clipPath: `inset(0 ${100 - wipe}% 0 0)`, opacity: ready ? 1 : 0 }}
        />
      ) : null}

      {!failed ? (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-px bg-primary/80"
            style={{ left: `${wipe}%` }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/90 text-[0.6rem] font-semibold text-foreground backdrop-blur-sm"
            style={{ left: `${wipe}%` }}
          >
            ⇔
          </span>

          {/* The real control: invisible, but focusable and fully keyboard-driven. */}
          <input
            type="range"
            min={0}
            max={100}
            value={wipe}
            onChange={(event) => setWipe(Number(event.target.value))}
            aria-label="Reveal the dithered image"
            className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none bg-transparent opacity-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </>
      ) : null}

      <figcaption className="absolute bottom-2 left-2.5 rounded bg-background/70 px-1.5 py-0.5 text-[0.6rem] uppercase tracking-[0.1em] text-muted-foreground backdrop-blur-sm">
        {failed ? "original" : `bayer 8×8 · ${levels} tones`}
      </figcaption>
    </figure>
  )
}
