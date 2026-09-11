"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, ExternalLink, Loader2, MailCheck, MailWarning } from "lucide-react"
import { toast } from "sonner"
import { Input, Textarea } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authClient } from "@/lib/auth-client"
import { updateProfile, type ProfileInput } from "@/server/actions/profile"
import { openBillingPortal } from "@/server/actions/billing"
import { checkPassword, PASSWORD_MIN_LENGTH } from "@/lib/password-policy"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

interface Profile extends ProfileInput {
  email: string
  emailVerified: boolean
}

export function SettingsForms({
  profile,
  plan,
  hasPassword,
  emailConfigured,
  billingEnabled,
  tokens,
}: {
  profile: Profile
  plan: { id: string; name: string; aiCredits: number }
  hasPassword: boolean
  emailConfigured: boolean
  billingEnabled: boolean
  /** rendered just before the danger zone, which always comes last */
  tokens?: React.ReactNode
}) {
  return (
    <div className="mt-10 flex flex-col gap-10">
      <ProfileSection profile={profile} />
      <PlanSection plan={plan} billingEnabled={billingEnabled} />
      <EmailSection
        email={profile.email}
        verified={profile.emailVerified}
        emailConfigured={emailConfigured}
      />
      {hasPassword && <PasswordSection email={profile.email} />}
      {tokens}
      <DangerSection />
    </div>
  )
}

function Section({
  title,
  description,
  children,
  tone = "default",
}: {
  title: string
  description?: string
  children: React.ReactNode
  tone?: "default" | "danger"
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-6",
        tone === "danger" ? "border-destructive/30 bg-destructive/[0.03]" : "border-border bg-card"
      )}
    >
      <h2 className="text-[15px] font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

function ProfileSection({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [form, setForm] = React.useState<ProfileInput>(profile)
  const [pending, setPending] = React.useState(false)

  const set = (key: keyof ProfileInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }))

  return (
    <Section title="Profile" description="Shown on your public author page and next to every component you publish.">
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault()
          setPending(true)
          const result = await updateProfile(form)
          setPending(false)
          if (!result.ok) {
            toast.error(result.error)
            return
          }
          toast.success("Profile updated")
          router.refresh()
        }}
      >
        <Field label="Name">
          <Input value={form.name} onChange={set("name")} maxLength={80} required />
        </Field>

        <Field label="Handle" hint={`${BRAND.domain}/@${form.handle || "your-handle"}`}>
          <Input
            value={form.handle}
            onChange={(event) =>
              setForm((current) => ({ ...current, handle: event.target.value.toLowerCase() }))
            }
            maxLength={24}
            required
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Bio" hint={`${(form.bio ?? "").length}/280`}>
            <Textarea value={form.bio ?? ""} onChange={set("bio")} maxLength={280} rows={3} />
          </Field>
        </div>

        <Field label="Website">
          <Input value={form.website ?? ""} onChange={set("website")} placeholder="yoursite.com" />
        </Field>

        <Field label="Location">
          <Input value={form.location ?? ""} onChange={set("location")} placeholder="Lisbon, PT" />
        </Field>

        <Field label="X / Twitter" hint="Without the @">
          <Input
            value={form.twitterUsername ?? ""}
            onChange={set("twitterUsername")}
            placeholder="yourhandle"
          />
        </Field>

        <div className="flex items-end sm:col-span-2">
          <Button type="submit" disabled={pending} className="gap-2">
            {pending && <Loader2 className="size-4 animate-spin" />}
            Save profile
          </Button>
        </div>
      </form>
    </Section>
  )
}

function PlanSection({
  plan,
  billingEnabled,
}: {
  plan: { id: string; name: string; aiCredits: number }
  billingEnabled: boolean
}) {
  const [pending, setPending] = React.useState(false)
  const paid = plan.id !== "free"

  return (
    <Section title="Plan" description="Copying source, prompts and CLI commands requires an active plan.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[15px] font-medium">
            {plan.name}
            {paid ? <Badge variant="new">Active</Badge> : <Badge>Free</Badge>}
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {paid
              ? plan.aiCredits > 0
                ? `${plan.aiCredits.toLocaleString()} AI credits a month.`
                : "Unlimited copies, CLI and MCP access."
              : "Previews are free. Copying needs a plan."}
          </p>
        </div>

        {paid && billingEnabled ? (
          <Button
            variant="outline"
            disabled={pending}
            className="gap-1.5"
            onClick={async () => {
              setPending(true)
              const result = await openBillingPortal()
              setPending(false)
              if (!result.ok) {
                toast.error(result.error)
                return
              }
              window.location.assign(result.data.url)
            }}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-3.5" />}
            Manage billing
          </Button>
        ) : (
          <Button asChild>
            <Link href="/pricing">{paid ? "See plans" : "Choose a plan"}</Link>
          </Button>
        )}
      </div>
    </Section>
  )
}

function EmailSection({
  email,
  verified,
  emailConfigured,
}: {
  email: string
  verified: boolean
  emailConfigured: boolean
}) {
  const [next, setNext] = React.useState(email)
  const [pending, setPending] = React.useState(false)

  return (
    <Section title="Email" description="Used to sign in and to reach you about your account.">
      <p className="mb-4 flex items-center gap-2 text-[13px]">
        {verified ? (
          <>
            <MailCheck className="size-4 text-emerald-400" />
            <span className="text-muted-foreground">{email} is verified</span>
          </>
        ) : (
          <>
            <MailWarning className="size-4 text-amber-400" />
            <span className="text-muted-foreground">
              {email} is not verified
              {!emailConfigured && " — email delivery isn't configured on this deployment"}
            </span>
          </>
        )}
      </p>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          if (next === email) return
          setPending(true)
          const { error } = await authClient.changeEmail({
            newEmail: next,
            callbackURL: "/settings",
          })
          setPending(false)
          if (error) {
            toast.error(error.message ?? "Could not change the email address.")
            return
          }
          toast.success("Check your inbox", {
            description: "Confirm the change from the link we sent to your current address.",
          })
        }}
      >
        <div className="min-w-[16rem] flex-1">
          <Field label="New email address">
            <Input type="email" value={next} onChange={(event) => setNext(event.target.value)} required />
          </Field>
        </div>
        <Button type="submit" variant="secondary" disabled={pending || next === email} className="gap-2">
          {pending && <Loader2 className="size-4 animate-spin" />}
          Change email
        </Button>
      </form>

      {!verified && emailConfigured && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 px-0"
          onClick={async () => {
            const { error } = await authClient.sendVerificationEmail({ email, callbackURL: "/settings" })
            if (error) toast.error("Could not send the email.")
            else toast.success("Verification email sent")
          }}
        >
          Resend verification email
        </Button>
      )}
    </Section>
  )
}

function PasswordSection({ email }: { email: string }) {
  const [current, setCurrent] = React.useState("")
  const [next, setNext] = React.useState("")
  const [signOutOthers, setSignOutOthers] = React.useState(true)
  const [pending, setPending] = React.useState(false)

  const problem = next ? checkPassword(next, [email]) : null

  return (
    <Section title="Password" description={`At least ${PASSWORD_MIN_LENGTH} characters.`}>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault()
          if (problem) {
            toast.error(problem.message)
            return
          }
          setPending(true)
          const { error } = await authClient.changePassword({
            currentPassword: current,
            newPassword: next,
            revokeOtherSessions: signOutOthers,
          })
          setPending(false)
          if (error) {
            toast.error(error.message ?? "That current password doesn't match.")
            return
          }
          setCurrent("")
          setNext("")
          toast.success("Password updated")
        }}
      >
        <Field label="Current password">
          <Input
            type="password"
            value={current}
            onChange={(event) => setCurrent(event.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>

        <Field label="New password">
          <Input
            type="password"
            value={next}
            onChange={(event) => setNext(event.target.value)}
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            required
          />
          {next.length > 0 && (
            <span className={cn("text-xs", problem ? "text-amber-400" : "text-emerald-400")}>
              {problem ? problem.message : "Strong enough."}
            </span>
          )}
        </Field>

        <label className="flex items-center gap-2 text-[13px] text-muted-foreground sm:col-span-2">
          <input
            type="checkbox"
            checked={signOutOthers}
            onChange={(event) => setSignOutOthers(event.target.checked)}
            className="size-4 accent-current"
          />
          Sign out everywhere else
        </label>

        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending || Boolean(problem)} className="gap-2">
            {pending && <Loader2 className="size-4 animate-spin" />}
            Update password
          </Button>
        </div>
      </form>
    </Section>
  )
}

function DangerSection() {
  const router = useRouter()
  const [confirm, setConfirm] = React.useState("")
  const [pending, setPending] = React.useState(false)

  return (
    <Section
      tone="danger"
      title="Delete account"
      description="Removes your profile, bookmarks, collections and published components. Cancel any active plan first — deleting here does not stop billing."
    >
      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={async (event) => {
          event.preventDefault()
          setPending(true)
          const { error } = await authClient.deleteUser({ callbackURL: "/" })
          setPending(false)
          if (error) {
            toast.error(error.message ?? "Could not delete the account.")
            return
          }
          toast("Account deleted")
          router.push("/")
          router.refresh()
        }}
      >
        <div className="min-w-[16rem] flex-1">
          <Field label="Type DELETE to confirm">
            <Input
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </Field>
        </div>
        <Button
          type="submit"
          variant="destructive"
          disabled={pending || confirm !== "DELETE"}
          className="gap-2"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <AlertTriangle className="size-4" />}
          Delete my account
        </Button>
      </form>
    </Section>
  )
}
