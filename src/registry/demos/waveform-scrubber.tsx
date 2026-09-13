"use client"

import * as React from "react"
import { Pause, Play, SkipBack } from "lucide-react"
import { WaveformScrubber, makePeaks } from "@/registry/components/waveform-scrubber"

const DURATION = 224

/**
 * The scrubber owns no clock, so the demo brings one: a plain rAF transport
 * standing in for whatever audio element this would really be wired to.
 */
export default function DemoWaveformScrubber() {
  const peaks = React.useMemo(() => makePeaks(170, 21), [])
  const [position, setPosition] = React.useState(38)
  const [playing, setPlaying] = React.useState(false)

  React.useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const delta = (now - last) / 1000
      last = now
      setPosition((prev) => {
        const next = prev + delta
        if (next >= DURATION) {
          setPlaying(false)
          return DURATION
        }
        return next
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  return (
    <div className="flex w-full justify-center bg-background p-6">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 pb-4">
          <button
            type="button"
            onClick={() => setPlaying((prev) => !prev)}
            aria-label={playing ? "Pause" : "Play"}
            className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4 translate-x-px" />}
          </button>
          <button
            type="button"
            onClick={() => setPosition(0)}
            aria-label="Back to start"
            className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <SkipBack className="size-3.5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">Low Country</p>
            <p className="truncate text-[0.72rem] text-muted-foreground">Studio Halden · Field Recordings</p>
          </div>
        </div>

        <WaveformScrubber
          peaks={peaks}
          duration={DURATION}
          position={position}
          onSeek={setPosition}
          label="Seek within Low Country"
        />
      </div>
    </div>
  )
}
