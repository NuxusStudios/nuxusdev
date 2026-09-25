"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Fingerprint, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { usePasskeySupport } from "@/lib/use-passkey-support"

interface PasskeyRow {
  id: string
  name?: string | null
  deviceType?: string | null
  backedUp?: boolean | null
  createdAt?: Date | string | null
}

function describe(key: PasskeyRow) {
  // "multiDevice" means the credential syncs through a keychain — iCloud,
  // Google Password Manager, 1Password. Worth saying, because it is the
  // difference between losing one device and losing the key.
  const synced = key.backedUp ? "Syncs across your devices" : "Stored on one device"
  const made = key.createdAt ? new Date(key.createdAt) : null
  return made
    ? `${synced} · added ${made.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`
    : synced
}

/**
 * Register and remove passkeys.
 *
 * The list is loaded on the client rather than passed in from the server page,
 * because registering one has to happen here anyway — the browser's WebAuthn
 * call only works in response to a user gesture — and refetching after it is
 * simpler than round-tripping through a server action for a list nobody else
 * can see.
 *
 * Every failure path is quiet by design. A person who starts a passkey prompt
 * and changes their mind gets `NotAllowedError`, which is not an error worth
 * shouting about; neither is a timeout.
 */
export function PasskeyManager() {
  const router = useRouter()
  const [busy, setBusy] = React.useState(false)
  const [removing, setRemoving] = React.useState<string | null>(null)
  const canUse = usePasskeySupport()

  // The plugin's own store, not a fetch of our own. It refreshes itself after a
  // registration or a delete, so nothing here has to remember to reload — and
  // it keeps the list out of an effect, which is where fetching it would
  // otherwise have to live.
  const { data, isPending } = authClient.useListPasskeys()
  const keys = (data ?? null) as PasskeyRow[] | null

  const add = async () => {
    setBusy(true)
    try {
      // A label the person will recognise later, when there are three of them.
      const name = `${navigator.platform || "This device"} · ${new Date().toLocaleDateString()}`
      const result = await authClient.passkey.addPasskey({ name })
      if (result?.error) {
        toast.error(result.error.message ?? "That passkey could not be registered.")
        return
      }
      toast.success("Passkey added. You can sign in with it from now on.")
      router.refresh()
    } catch (error) {
      // Cancelling the browser prompt lands here and is not a failure.
      if (error instanceof Error && error.name === "NotAllowedError") return
      toast.error("That passkey could not be registered.")
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id: string) => {
    setRemoving(id)
    try {
      const { error } = await authClient.passkey.deletePasskey({ id })
      if (error) {
        toast.error(error.message ?? "That passkey could not be removed.")
        return
      }
      toast.success("Passkey removed.")
    } finally {
      setRemoving(null)
    }
  }

  if (!canUse) {
    return (
      <p className="text-[13px] text-muted-foreground">
        This browser does not support passkeys. Try Safari, Chrome or Edge on a recent device.
      </p>
    )
  }

  return (
    <div className="grid gap-4">
      {isPending && keys === null ? (
        <p className="text-[13px] text-muted-foreground">Loading…</p>
      ) : !keys || keys.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          No passkeys yet. Add one and you can sign in with Touch ID, Face ID, a fingerprint or a
          security key instead of typing anything.
        </p>
      ) : (
        <ul className="grid gap-2">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
            >
              <Fingerprint aria-hidden className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium">{key.name || "Passkey"}</p>
                <p className="truncate text-xs text-muted-foreground">{describe(key)}</p>
              </div>
              <button
                type="button"
                onClick={() => remove(key.id)}
                disabled={removing === key.id}
                aria-label={`Remove ${key.name || "this passkey"}`}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
              >
                {removing === key.id ? (
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                ) : (
                  <Trash2 aria-hidden className="size-4" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <Button type="button" onClick={add} disabled={busy} variant="outline">
          {busy ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Fingerprint aria-hidden className="size-4" />}
          Add a passkey
        </Button>
      </div>

      {keys && keys.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Keep another way in — a password or a magic link — in case you lose every device holding a
          passkey.
        </p>
      ) : null}
    </div>
  )
}
