"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/** Platform never changes, so the store subscribes to nothing. */
function useIsMac() {
  return React.useSyncExternalStore(
    () => () => {},
    () => /mac|iphone|ipad/i.test(navigator.userAgent),
    () => false,
  )
}

/** A key press inside a field belongs to the field, not to a shortcut. */
function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable
}

export interface KeycapButtonProps extends Omit<React.ComponentProps<"button">, "onClick"> {
  /** The key that also triggers it, e.g. "k". Case-insensitive. */
  shortcut?: string
  /** Require the platform's command key alongside the shortcut. */
  meta?: boolean
  onTrigger?: () => void
}

/**
 * A button shaped like a physical keycap, wired to the key it depicts.
 *
 * The legend isn't decoration: pressing that key on the keyboard depresses the
 * cap and fires the same handler. A shortcut hint printed on a control that
 * doesn't respond to the shortcut is a small lie, and this is the version that
 * isn't one.
 *
 * Depth is two shadows — a hard one standing the cap off the page and an inset
 * highlight along the top bevel. Pressing moves the cap down by exactly the
 * height of the hard shadow and removes it, so the cap lands on the page
 * instead of sliding around above it.
 */
export function KeycapButton({
  shortcut,
  meta = false,
  onTrigger,
  children,
  className,
  disabled,
  ...props
}: KeycapButtonProps) {
  const isMac = useIsMac()
  const [down, setDown] = React.useState(false)
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (!shortcut || disabled) return

    let releaseTimer = 0

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || isTyping(event.target)) return
      if (event.key.toLowerCase() !== shortcut.toLowerCase()) return
      if (meta && !(event.metaKey || event.ctrlKey)) return
      if (!meta && (event.metaKey || event.ctrlKey || event.altKey)) return

      event.preventDefault()
      setDown(true)
      onTrigger?.()

      // A tap on the keyboard can be shorter than the animation reads as a
      // press, so hold the depressed state briefly rather than tracking keyup.
      window.clearTimeout(releaseTimer)
      releaseTimer = window.setTimeout(() => setDown(false), 130)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.clearTimeout(releaseTimer)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [disabled, meta, onTrigger, shortcut])

  const legend = shortcut ? `${meta ? (isMac ? "⌘" : "Ctrl ") : ""}${shortcut.toUpperCase()}` : null

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onTrigger}
      disabled={disabled}
      data-down={down || undefined}
      aria-keyshortcuts={shortcut ? `${meta ? "Meta+" : ""}${shortcut.toUpperCase()}` : undefined}
      className={cn(
        "group relative inline-flex select-none items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-3",
        "text-sm font-semibold text-foreground",
        // The hard shadow is the cap's height off the page.
        "shadow-[0_4px_0_0_var(--color-border),inset_0_1px_0_0_color-mix(in_oklch,var(--color-foreground)_12%,transparent)]",
        "transition-[translate,box-shadow,border-color] duration-100 ease-out",
        "hover:enabled:border-foreground/25",
        // Pressed: travel exactly the shadow's height and lose the shadow.
        "active:enabled:translate-y-[4px] active:enabled:shadow-[0_0_0_0_var(--color-border),inset_0_1px_0_0_color-mix(in_oklch,var(--color-foreground)_12%,transparent)]",
        "data-[down]:translate-y-[4px] data-[down]:shadow-[0_0_0_0_var(--color-border),inset_0_1px_0_0_color-mix(in_oklch,var(--color-foreground)_12%,transparent)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      {children}
      {legend ? (
        <kbd
          aria-hidden
          className={cn(
            "ml-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[0.7rem] font-medium leading-none text-muted-foreground",
            "transition-colors group-hover:enabled:text-foreground",
          )}
        >
          {legend}
        </kbd>
      ) : null}
    </button>
  )
}
