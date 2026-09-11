"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Logo } from "@/components/site/logo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { checkPassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy"
import { cn } from "@/lib/utils"

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(0,143,233,0.14),transparent_70%)]"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-2xl shadow-black/40">
          {children}
        </div>
      </div>
    </div>
  )
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-[13px] text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {children}
    </div>
  )
}

/** Step one: ask for the address. Always reports success, whether or not the account exists. */
export function PasswordResetRequest() {
  const [email, setEmail] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  if (sent) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center">
          <span className="mb-5 flex size-11 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Check className="size-5" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            If an account exists for <span className="text-foreground">{email}</span>, a reset link
            is on its way. It expires in an hour.
          </p>
          <Button variant="ghost" asChild className="mt-6">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll email you a link to choose a new one.
        </p>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          setPending(true)
          setError(null)
          const { error } = await authClient.requestPasswordReset({
            email,
            redirectTo: "/reset-password",
          })
          setPending(false)
          // never distinguish "no such account" — that's an enumeration oracle
          if (error && error.status !== 400) {
            setError("Could not send the email. Try again shortly.")
            return
          }
          setSent(true)
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium">Email</span>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
            className="h-10"
          />
        </label>
        <Button type="submit" className="h-10 gap-2" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        <Link href="/sign-in" className="underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </Shell>
  )
}

/** Step two: the link lands here with a token. */
export function PasswordResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const problem = password ? checkPassword(password) : null

  if (!token) {
    return (
      <Shell>
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">This link isn&apos;t valid</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Reset links expire after an hour and can only be used once.
          </p>
          <Button asChild className="mt-6">
            <Link href="/forgot-password">Request a new one</Link>
          </Button>
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          At least {PASSWORD_MIN_LENGTH} characters.
        </p>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}

      <form
        className="grid gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          if (problem) {
            setError(problem.message)
            return
          }
          setPending(true)
          setError(null)
          const { error } = await authClient.resetPassword({ newPassword: password, token })
          setPending(false)
          if (error) {
            setError(error.message ?? "That link has expired. Request a new one.")
            return
          }
          toast.success("Password updated")
          router.push("/sign-in")
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-[13px] font-medium">New password</span>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••••••"
            className="h-10"
            minLength={PASSWORD_MIN_LENGTH}
          />
          {password.length > 0 && (
            <span className={cn("text-xs", problem ? "text-amber-400" : "text-emerald-400")}>
              {problem ? problem.message : "Strong enough."}
            </span>
          )}
        </label>
        <Button type="submit" className="h-10 gap-2" disabled={pending || Boolean(problem)}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </Shell>
  )
}
