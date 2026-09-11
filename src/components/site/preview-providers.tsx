"use client"

import { ThemeProvider } from "next-themes"

/**
 * Imported registry components read the active theme through next-themes.
 * Previews always render dark, so the provider is forced rather than wired to
 * the app's own toggle.
 */
export function PreviewProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      {children}
    </ThemeProvider>
  )
}
