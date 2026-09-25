"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Check, Fingerprint, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Logo } from "@/components/site/logo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { usePasskeySupport } from "@/lib/use-passkey-support"
import { BRAND } from "@/lib/brand"
import { checkPassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy"
import { cn } from "@/lib/utils"

export interface AuthProviders {
  github: boolean
  google: boolean
  email: boolean
}

type Method = "password" | "magic-link"

export function AuthCard({
  mode,
  providers,
}: {
  mode: "sign-in" | "sign-up"
  providers: AuthProviders
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") ?? "/"

  const isSignUp = mode === "sign-up"
  const [method, setMethod] = React.useState<Method>("password")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)
  const passkeysUsable = usePasskeySupport()

  const passwordProblem = React.useMemo(
    () => (password ? checkPassword(password, [email, name]) : null),
    [password, email, name]
  )

  const hasSocial = providers.github || providers.google

  async function withPending<T>(key: string, fn: () => Promise<T>) {
    setError(null)
    setPending(key)
    try {
      await fn()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.")
    } finally {
      setPending(null)
    }
  }

  const social = (provider: "github" | "google") =>
    withPending(provider, async () => {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: next,
      })
      if (error) setError(error.message ?? "Could not start sign-in.")
    })

  const submitPassword = (event: React.FormEvent) => {
    event.preventDefault()
    return withPending("password", async () => {
      if (isSignUp) {
        const problem = checkPassword(password, [email, name])
        if (problem) {
          setError(problem.message)
          return
        }

        const { error } = await authClient.signUp.email({
          name: name.trim() || email.split("@")[0],
          email,
          password,
          callbackURL: next,
        })

        if (error) {
          setError(error.message ?? "Could not create the account.")
          return
        }

        if (providers.email) {
          setSent(true)
          toast.success("Check your email", { description: `We sent a link to ${email}` })
          return
        }

        toast.success(`Welcome to ${BRAND.name}`)
        router.push(next)
        router.refresh()
        return
      }

      const { error } = await authClient.signIn.email({ email, password, callbackURL: next })
      if (error) {
        // deliberately generic — don't reveal whether the address exists
        setError(
          error.status === 403
            ? "Verify your email address before signing in."
            : "That email and password don't match."
        )
        return
      }

      router.push(next)
      router.refresh()
    })
  }

  /**
   * Sign in with a passkey.
   *
   * No email is asked for first: the browser already knows which credentials it
   * holds for this domain and shows the person a chooser. Asking for an address
   * would be a step that exists only to tell the server something the browser
   * is about to prove anyway.
   */
  const submitPasskey = () =>
    withPending("passkey", async () => {
      try {
        const result = await authClient.signIn.passkey()
        if (result?.error) {
          setError(result.error.message ?? "That passkey was not accepted.")
          return
        }
        router.push(next)
        router.refresh()
      } catch (cause) {
        // Dismissing the browser's prompt is a decision, not a failure.
        if (cause instanceof Error && cause.name === "NotAllowedError") return
        setError("That passkey was not accepted.")
      }
    })

  const submitMagicLink = (event: React.FormEvent) => {
    event.preventDefault()
    return withPending("magic", async () => {
      const { error } = await authClient.signIn.magicLink({ email, callbackURL: next })
      if (error) {
        setError(error.message ?? "Could not send the link.")
        return
      }
      setSent(true)
    })
  }

  if (sent) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center">
          <span className="mb-5 flex size-11 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Check className="size-5" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We sent a link to <span className="text-foreground">{email}</span>. It expires shortly
            and can only be used once.
          </p>
          <Button variant="ghost" className="mt-6" onClick={() => setSent(false)}>
            Use a different address
          </Button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignUp
            ? "Publish components, save bookmarks, build lists."
            : "Sign in to your bookmarks and collections."}
        </p>
      </div>

      {hasSocial && (
        <>
          <div className="grid gap-2">
            {providers.github && (
              <Button
                variant="secondary"
                className="h-10 justify-center gap-2"
                disabled={pending !== null}
                onClick={() => social("github")}
              >
                {pending === "github" ? <Loader2 className="size-4 animate-spin" /> : <GithubIcon />}
                Continue with GitHub
              </Button>
            )}
            {providers.google && (
              <Button
                variant="secondary"
                className="h-10 justify-center gap-2"
                disabled={pending !== null}
                onClick={() => social("google")}
              >
                {pending === "google" ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
                Continue with Google
              </Button>
            )}
          </div>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      {!isSignUp && passkeysUsable && (
        <>
          <Button
            variant="secondary"
            className="h-10 w-full justify-center gap-2"
            disabled={pending !== null}
            onClick={submitPasskey}
          >
            {pending === "passkey" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Fingerprint className="size-4" />
            )}
            Sign in with a passkey
          </Button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}

      {method === "password" ? (
        <form className="grid gap-3" onSubmit={submitPassword}>
          {isSignUp && (
            <Field label="Name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Ada Lovelace"
                maxLength={80}
              />
            </Field>
          )}

          <Field label="Email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@company.com"
                className="h-10 pl-9"
              />
            </div>
          </Field>

          <Field
            label="Password"
            hint={isSignUp ? `At least ${PASSWORD_MIN_LENGTH} characters` : undefined}
            action={
              !isSignUp ? (
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Forgot?
                </Link>
              ) : undefined
            }
          >
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              placeholder="••••••••••••"
              className="h-10"
              minLength={isSignUp ? PASSWORD_MIN_LENGTH : undefined}
            />
            {isSignUp && password.length > 0 && (
              <p
                className={cn(
                  "mt-1.5 text-xs",
                  passwordProblem ? "text-amber-400" : "text-emerald-400"
                )}
              >
                {passwordProblem ? passwordProblem.message : "Strong enough."}
              </p>
            )}
          </Field>

          <Button
            type="submit"
            className="mt-1 h-10 gap-2"
            disabled={pending !== null || (isSignUp && Boolean(passwordProblem))}
          >
            {pending === "password" && <Loader2 className="size-4 animate-spin" />}
            {isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>
      ) : (
        <form className="grid gap-3" onSubmit={submitMagicLink}>
          <Field label="Email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@company.com"
                className="h-10 pl-9"
              />
            </div>
          </Field>
          <Button type="submit" className="h-10 gap-2" disabled={pending !== null}>
            {pending === "magic" && <Loader2 className="size-4 animate-spin" />}
            Email me a sign-in link
          </Button>
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          setMethod((m) => (m === "password" ? "magic-link" : "password"))
          setError(null)
        }}
        className="mt-4 w-full text-center text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {method === "password" ? "Sign in with a magic link instead" : "Use a password instead"}
      </button>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        {isSignUp ? "Already have an account?" : `New to ${BRAND.name}?`}{" "}
        <Link
          href={isSignUp ? "/sign-in" : "/sign-up"}
          className="text-foreground underline-offset-4 hover:underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(0,143,233,0.16),transparent_70%)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-2xl shadow-black/40">
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground/70">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline-offset-4 hover:underline">Terms</Link> and{" "}
          <Link href="/privacy" className="underline-offset-4 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  action,
  children,
}: {
  label: string
  hint?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-1.5">
      <span className="flex items-center justify-between">
        <span className="text-[13px] font-medium">{label}</span>
        {action}
      </span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
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
