"use client"

import * as React from "react"
import { Loader2, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

export function SignInCard({
  onSubmit,
  title = "Welcome back",
  subtitle = "Sign in to continue to your workspace",
}: {
  onSubmit?: (email: string) => void
  title?: string
  subtitle?: string
}) {
  const [email, setEmail] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  return (
    <div className="w-full max-w-sm rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
      <div className="mb-6 flex flex-col gap-1.5 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-foreground/45">{subtitle}</p>
      </div>

      <div className="grid gap-2">
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-foreground/12 bg-foreground/[0.04] text-sm font-medium text-foreground transition hover:bg-foreground/[0.08]">
          <GithubIcon /> Continue with GitHub
        </button>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-foreground/12 bg-foreground/[0.04] text-sm font-medium text-foreground transition hover:bg-foreground/[0.08]">
          <GoogleIcon /> Continue with Google
        </button>
      </div>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-foreground/10" />
        <span className="text-[11px] uppercase tracking-widest text-foreground/30">or</span>
        <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setLoading(true)
          setTimeout(() => setLoading(false), 1200)
          onSubmit?.(email)
        }}
        className="grid gap-3"
      >
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-foreground/60">Email</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground/30" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className={cn(
                "h-10 w-full rounded-lg border border-foreground/12 bg-background/30 pl-9 pr-3 text-sm text-foreground",
                "placeholder:text-foreground/25 outline-none transition focus:border-foreground/25 focus:ring-2 focus:ring-foreground/10"
              )}
            />
          </div>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition hover:bg-foreground/90 disabled:opacity-70"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "Sending link…" : "Send magic link"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-foreground/35">
        By continuing you agree to our <span className="text-foreground/60 underline">Terms</span>.
      </p>
    </div>
  )
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.31-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  )
}
