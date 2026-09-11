"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

type Theme = "light" | "dark" | "system"

const OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: "system", icon: <Monitor className="size-3.5" />, label: "System theme" },
  { value: "light", icon: <Sun className="size-3.5" />, label: "Light theme" },
  { value: "dark", icon: <Moon className="size-3.5" />, label: "Dark theme" },
]

function apply(theme: Theme) {
  const root = document.documentElement
  const dark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  root.classList.toggle("dark", dark)
  root.classList.toggle("light", !dark)
}

function read(): Theme {
  try {
    return (localStorage.getItem("theme") as Theme | null) ?? "dark"
  } catch {
    return "dark"
  }
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function ThemeToggle({ className }: { className?: string }) {
  // the inline script in <head> has already applied the stored theme, so the
  // toggle reads it rather than re-syncing it through state
  const theme = React.useSyncExternalStore(subscribe, read, () => "dark" as Theme)

  function select(next: Theme) {
    try {
      localStorage.setItem("theme", next)
    } catch {}
    apply(next)
    listeners.forEach((listener) => listener())
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-secondary/40 p-0.5",
        className
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => select(opt.value)}
          aria-label={opt.label}
          title={opt.label}
          className={cn(
            "flex size-6 items-center justify-center rounded-full transition-colors",
            theme === opt.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  )
}
