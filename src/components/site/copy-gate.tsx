"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Lock, Sparkles } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getCopyPayload, type CopyKind } from "@/server/actions/source"
import { readEntitlements } from "@/server/actions/entitlements"
import { BRAND } from "@/lib/brand"

interface CopyGate {
  /** Fetches the text server-side and puts it on the clipboard. */
  copy: (
    componentId: string,
    kind: CopyKind,
    options?: { label?: string; manager?: "npm" | "pnpm" | "yarn" | "bun" }
  ) => Promise<boolean>
  /**
   * For text the browser generated itself (a gradient, ASCII art, an icon
   * snippet). The plan check still applies, but the content was never secret —
   * this gate is about the product, not about hiding bytes.
   */
  copyText: (text: string, label?: string) => Promise<boolean>
  /** display hint for lock icons; the server decides for real */
  canCopy: boolean
  signedIn: boolean
  pending: string | null
}

const Context = React.createContext<CopyGate | null>(null)

const LABELS: Record<CopyKind, string> = {
  prompt: "Prompt copied",
  component: "Component copied",
  demo: "Demo copied",
  cli: "Command copied",
}

/**
 * Every copy action in the app goes through here. The text is never in the
 * page — it is fetched on click, and the server refuses the request outright
 * without a plan.
 */
export function CopyGateProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = React.useState<string | null>(null)
  const [blocked, setBlocked] = React.useState<"signed_out" | "no_plan" | null>(null)
  const [access, setAccess] = React.useState({ canCopy: false, signedIn: false })

  React.useEffect(() => {
    let cancelled = false
    readEntitlements().then((result) => {
      if (!cancelled) setAccess({ canCopy: result.canCopy, signedIn: result.signedIn })
    })
    return () => {
      cancelled = true
    }
  }, [])

  const copy = React.useCallback<CopyGate["copy"]>(async (componentId, kind, options) => {
    const key = `${componentId}:${kind}`
    setPending(key)

    try {
      const result = await getCopyPayload(componentId, kind, options?.manager ?? "npm")

      if (!result.ok) {
        if (result.code?.startsWith("payment_required")) {
          setBlocked(result.code.endsWith("signed_out") ? "signed_out" : "no_plan")
          return false
        }
        toast.error(result.error)
        return false
      }

      await navigator.clipboard.writeText(result.data.text)
      toast.success(LABELS[kind], { description: options?.label })
      return true
    } catch {
      toast.error("Couldn't copy to the clipboard.")
      return false
    } finally {
      setPending(null)
    }
  }, [])

  const copyText = React.useCallback<CopyGate["copyText"]>(
    async (text, label) => {
      const entitlements = await readEntitlements()

      if (!entitlements.canCopy) {
        setBlocked(entitlements.reason ?? "no_plan")
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        toast.success("Copied", { description: label })
        return true
      } catch {
        toast.error("Couldn't copy to the clipboard.")
        return false
      }
    },
    []
  )

  const value = React.useMemo(
    () => ({ copy, copyText, pending, canCopy: access.canCopy, signedIn: access.signedIn }),
    [copy, copyText, pending, access]
  )

  return (
    <Context.Provider value={value}>
      {children}
      <UpgradeDialog reason={blocked} onClose={() => setBlocked(null)} />
    </Context.Provider>
  )
}

export function useCopyGate(): CopyGate {
  const context = React.useContext(Context)
  if (!context) {
    throw new Error("useCopyGate must be used inside CopyGateProvider")
  }
  return context
}

const PERKS = [
  "Unlimited code and prompt copies",
  "Install through the CLI and MCP",
  "29,000 icons, searched by meaning",
  "Unlimited shaders, gradients and ASCII art",
]

function UpgradeDialog({
  reason,
  onClose,
}: {
  reason: "signed_out" | "no_plan" | null
  onClose: () => void
}) {
  const signedOut = reason === "signed_out"

  return (
    <Dialog open={reason !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <span className="mb-3 flex size-10 items-center justify-center rounded-xl border border-brand/30 bg-brand/12 text-brand">
            <Lock className="size-5" />
          </span>
          <DialogTitle>
            {signedOut ? `Sign in to copy` : `Copying is a paid feature`}
          </DialogTitle>
          <DialogDescription>
            {signedOut
              ? `Previews are free to browse. Copying source, prompts and CLI commands needs an account on a plan.`
              : `Browsing and previewing every component stays free. Taking the code needs a plan — it's what keeps ${BRAND.name} running and pays the authors.`}
          </DialogDescription>
        </DialogHeader>

        <ul className="mt-5 space-y-2.5">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5 text-[13px]">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-400/80" />
              {perk}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <Button asChild className="gap-1.5 sm:flex-1">
            <Link href="/pricing" onClick={onClose}>
              <Sparkles className="size-3.5" />
              {signedOut ? "See plans" : "Choose a plan"}
            </Link>
          </Button>
          {signedOut && (
            <Button variant="outline" asChild className="sm:flex-1">
              <Link href="/sign-in" onClick={onClose}>
                Sign in
              </Link>
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          From $6/month. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  )
}
