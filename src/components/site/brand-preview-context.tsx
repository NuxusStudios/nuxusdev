"use client"

import * as React from "react"

/**
 * Which theme every preview on the page renders in.
 *
 * Null is the site default. "mine" is the signed-in user's saved tokens; any
 * other value is a catalogue theme slug.
 *
 * localStorage is an external store, so it's read through useSyncExternalStore
 * rather than an effect — the server snapshot is always null, which matches the
 * markup the server produced, and the real value arrives on hydration.
 */

const KEY = "nuxus:preview-theme"

const listeners = new Set<() => void>()
let cached: string | null = null
let read = false

function getSnapshot(): string | null {
  if (!read) {
    try {
      cached = window.localStorage.getItem(KEY)
    } catch {
      cached = null // private mode, or site data blocked
    }
    read = true
  }
  return cached
}

/** The server has no localStorage, so it always renders the default theme. */
function getServerSnapshot(): string | null {
  return null
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function write(theme: string | null): void {
  cached = theme
  read = true
  try {
    if (theme) window.localStorage.setItem(KEY, theme)
    else window.localStorage.removeItem(KEY)
  } catch {
    /* the preference just won't persist */
  }
  for (const listener of listeners) listener()
}

interface Value {
  theme: string | null
  setTheme: (theme: string | null) => void
  /** false when the user hasn't saved any tokens, so "mine" would do nothing */
  hasBrandTheme: boolean
}

const Context = React.createContext(false)

export function BrandPreviewProvider({
  hasBrandTheme,
  children,
}: {
  hasBrandTheme: boolean
  children: React.ReactNode
}) {
  return <Context.Provider value={hasBrandTheme}>{children}</Context.Provider>
}

export function useBrandPreview(): Value {
  const hasBrandTheme = React.useContext(Context)
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return { theme, setTheme: write, hasBrandTheme }
}

/** The query string to append to a preview URL, including the leading "?". */
export function previewQuery(theme: string | null): string {
  return theme ? `?theme=${encodeURIComponent(theme)}` : ""
}
