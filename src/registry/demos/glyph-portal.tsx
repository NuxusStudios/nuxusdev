"use client"

import GlyphPortal from "@/registry/components/glyph-portal"

/**
 * The original demo fetched a webfont from a third-party CDN. This one uses the
 * component's own fallback stack instead — the effect is measured from whatever
 * face is actually available, so it works with no network dependency at all.
 */
export default function DemoGlyphPortal() {
  return (
    <div
      tabIndex={0}
      role="region"
      aria-label="Sublime. Scroll to step inside."
      className="h-[560px] w-full overflow-y-auto bg-background"
      style={{ containerType: "inline-size" }}
    >
      <GlyphPortal word="SUBLIME" scrollLength={2.4} enterLabel="Step inside">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-start gap-8">
          <h2 className="max-w-3xl text-3xl font-normal leading-tight">
            A different way into what comes next.
          </h2>
          <div className="grid w-full gap-7 md:grid-cols-3 md:gap-14">
            <div className="border-t border-current/20 pt-4">
              <h3 className="text-lg font-medium">Choose your way in</h3>
              <p className="mt-2 text-[15px] leading-relaxed opacity-85">
                Pick any letter, then scroll. Each path takes you into the same place.
              </p>
            </div>
            <div className="border-t border-current/20 pt-4">
              <h3 className="text-lg font-medium">Set the scene</h3>
              <p className="mt-2 text-[15px] leading-relaxed opacity-85">
                A gradient, photograph, video or canvas can sit behind the word.
              </p>
            </div>
            <div className="border-t border-current/20 pt-4">
              <h3 className="text-lg font-medium">Keep going</h3>
              <p className="mt-2 text-[15px] leading-relaxed opacity-85">
                The next section is yours — a story, a project, a reason to stay.
              </p>
            </div>
          </div>
        </div>
      </GlyphPortal>
    </div>
  )
}
