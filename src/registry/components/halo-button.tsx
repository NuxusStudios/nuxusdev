"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Tokens fall back through both spellings — Tailwind v4's `--color-*` and
 * shadcn's bare `--primary` — so the button themes itself in either kind of
 * project before settling for plain currentColor.
 */
const HALO_CSS = `
@property --halo-angle  { syntax: "<angle>"; initial-value: 0deg;  inherits: true; }
@property --halo-boost  { syntax: "<angle>"; initial-value: 0deg;  inherits: true; }
@property --halo-spread { syntax: "<angle>"; initial-value: 18deg; inherits: true; }
@property --halo-lead   { syntax: "<angle>"; initial-value: 0deg;  inherits: true; }
@property --halo-glow   { syntax: "<percentage>"; initial-value: 45%; inherits: true; }

.halo-btn {
  --halo-accent: var(--color-primary, var(--primary, currentColor));
  --halo-surface: var(--color-background, var(--background, #09090b));
  --halo-ink: var(--color-foreground, var(--foreground, #fafafa));
  --halo-period: 3.4s;

  position: relative;
  isolation: isolate;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  overflow: hidden;
  cursor: pointer;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 9999px;
  color: var(--halo-ink);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;

  /* The arc is the border itself: a conic gradient painted into border-box and
     covered everywhere else by a solid padding-box layer. Its stops are angles,
     not percentages, so the dot mask below can find the brightest point. */
  background:
    linear-gradient(var(--halo-surface), var(--halo-surface)) padding-box,
    conic-gradient(
      from calc(var(--halo-angle) + var(--halo-boost) - var(--halo-lead)),
      transparent 0deg,
      color-mix(in oklch, var(--halo-accent) 55%, transparent) var(--halo-spread),
      var(--halo-accent) calc(var(--halo-spread) * 2),
      color-mix(in oklch, var(--halo-accent) 55%, transparent) calc(var(--halo-spread) * 3),
      transparent calc(var(--halo-spread) * 4)
    ) border-box;
  box-shadow: inset 0 0 0 1px color-mix(in oklch, var(--halo-ink) 7%, transparent);

  /* Two clocks. The first always runs; the second only runs while hovered and
     adds to the first. Pausing a clock keeps its angle, so leaving and
     re-entering never snaps the arc — changing one animation's duration would. */
  animation:
    halo-orbit var(--halo-period) linear infinite,
    halo-boost calc(var(--halo-period) / 2.5) linear infinite paused;
  transition:
    --halo-spread 750ms cubic-bezier(0.25, 1, 0.5, 1),
    --halo-lead 750ms cubic-bezier(0.25, 1, 0.5, 1),
    translate 150ms ease;
}

.halo-btn[data-size="sm"] { padding: 0.6em 1.3em; font-size: 0.8125rem; }
.halo-btn[data-size="md"] { padding: 0.9em 1.9em; font-size: 0.9375rem; }
.halo-btn[data-size="lg"] { padding: 1.15em 2.5em; font-size: 1.0625rem; }

/* Dot matrix, lit only under the arc. The arc's brightest stop sits at
   spread × 2 past its start, less the lead — and the hover moves spread and
   lead together so that point never shifts: 36deg at rest, 36deg hovered. */
.halo-btn::before {
  content: "";
  position: absolute;
  inset: 3px;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  background-image: radial-gradient(circle at 1.5px 1.5px, var(--halo-accent) 0.6px, transparent 1.1px);
  background-size: 4px 4px;
  -webkit-mask-image: conic-gradient(from calc(var(--halo-angle) + var(--halo-boost) + 36deg), #000, transparent 14% 86%, #000);
  mask-image: conic-gradient(from calc(var(--halo-angle) + var(--halo-boost) + 36deg), #000, transparent 14% 86%, #000);
  opacity: 0.3;
  transition: opacity 750ms cubic-bezier(0.25, 1, 0.5, 1);
}

/* Inner glow rising from the lower edge. It breathes by animating its own
   strength rather than its opacity, so the fade-in transition isn't overridden. */
.halo-btn::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  border-radius: inherit;
  box-shadow: inset 0 -0.85em 1.6em -0.5em color-mix(in oklch, var(--halo-accent) var(--halo-glow), transparent);
  opacity: 0;
  transition: opacity 750ms cubic-bezier(0.25, 1, 0.5, 1);
}

.halo-btn:not(:disabled):is(:hover, :focus-visible) {
  --halo-spread: 72deg;
  --halo-lead: 108deg;
  animation-play-state: running;
}
.halo-btn:not(:disabled):is(:hover, :focus-visible)::before { opacity: 0.55; }
.halo-btn:not(:disabled):is(:hover, :focus-visible)::after {
  opacity: 1;
  animation: halo-breathe 2.6s ease-in-out infinite;
}

.halo-btn:not(:disabled):active { translate: 0 1px; }
.halo-btn:focus-visible { outline: 2px solid var(--halo-accent); outline-offset: 4px; }
.halo-btn:disabled { cursor: not-allowed; opacity: 0.5; animation-play-state: paused; }

@keyframes halo-orbit   { to { --halo-angle: 360deg; } }
@keyframes halo-boost   { to { --halo-boost: 360deg; } }
@keyframes halo-breathe { 0%, 100% { --halo-glow: 38%; } 50% { --halo-glow: 70%; } }

@media (prefers-reduced-motion: reduce) {
  /* Park the arc somewhere visible instead of removing it. */
  .halo-btn { animation: none; --halo-angle: 210deg; }
  .halo-btn:not(:disabled):is(:hover, :focus-visible)::after { animation: none; }
}
`

export interface HaloButtonProps extends React.ComponentProps<"button"> {
  /** Any CSS colour for the arc, dots and glow. Defaults to the theme's primary. */
  accent?: string
  size?: "sm" | "md" | "lg"
}

/**
 * A call-to-action with a single arc of light orbiting its border.
 *
 * The CSS ships as one `<style>` keyed with `href` and `precedence`, which React
 * 19 hoists into the head and deduplicates — twenty buttons on a page register
 * the animated properties once, not twenty times.
 */
export function HaloButton({
  accent,
  size = "md",
  type = "button",
  className,
  style,
  children,
  ...props
}: HaloButtonProps) {
  return (
    <>
      <style href="nuxus-halo-button" precedence="medium">
        {HALO_CSS}
      </style>
      <button
        type={type}
        data-size={size}
        className={cn("halo-btn", className)}
        style={accent ? ({ ...style, "--halo-accent": accent } as React.CSSProperties) : style}
        {...props}
      >
        {children}
      </button>
    </>
  )
}
