"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Copy, KeyRound, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { deleteToken, getTokens, issueToken, type TokenSummary } from "@/server/actions/tokens"
import { BRAND } from "@/lib/brand"

/**
 * Personal access tokens for the CLI and MCP server.
 *
 * A freshly created token is shown exactly once — we only ever store its hash,
 * so there is nothing to reveal later.
 */
export function TokenManager({
  canUseRegistryApi,
  initialTokens,
}: {
  canUseRegistryApi: boolean
  initialTokens: TokenSummary[]
}) {
  const [tokens, setTokens] = React.useState<TokenSummary[]>(initialTokens)
  const [name, setName] = React.useState("")
  const [creating, setCreating] = React.useState(false)
  const [fresh, setFresh] = React.useState<{ name: string; token: string } | null>(null)

  // the first list arrives with the page; this only re-reads after a mutation
  const refresh = React.useCallback(async () => {
    const result = await getTokens()
    if (result.ok) setTokens(result.data)
  }, [])

  async function create(event: React.FormEvent) {
    event.preventDefault()
    setCreating(true)
    const result = await issueToken(name)
    setCreating(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setFresh({ name: result.data.name, token: result.data.token })
    setName("")
    void refresh()
  }

  async function revoke(token: TokenSummary) {
    // optimistic: the row disappears immediately, the server is the authority
    setTokens((current) => current.filter((row) => row.id !== token.id))
    const result = await deleteToken(token.id)
    if (!result.ok) {
      toast.error(result.error)
      void refresh()
      return
    }
    toast(`Revoked "${token.name}"`)
  }

  return (
    <div className="flex flex-col gap-5">
      {!canUseRegistryApi && (
        <p className="rounded-lg border border-border bg-muted/40 px-3.5 py-3 text-[13px] leading-relaxed text-muted-foreground">
          You can create a token now, but the registry and MCP server return component source only
          on a paid plan.{" "}
          <Link href="/pricing" className="text-foreground underline underline-offset-4">
            See plans
          </Link>
          .
        </p>
      )}

      {fresh && <FreshToken name={fresh.name} token={fresh.token} onDismiss={() => setFresh(null)} />}

      <form className="flex flex-wrap items-end gap-3" onSubmit={create}>
        <label className="grid min-w-[16rem] flex-1 gap-1.5">
          <span className="text-[13px] font-medium">Token name</span>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="MacBook — Claude Code"
            maxLength={80}
            autoComplete="off"
          />
        </label>
        <Button type="submit" disabled={creating || name.trim().length === 0} className="gap-2">
          {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Create token
        </Button>
      </form>

      <TokenList tokens={tokens} onRevoke={revoke} />

      <details className="group rounded-lg border border-border bg-muted/30 px-3.5 py-3">
        <summary className="cursor-pointer list-none text-[13px] font-medium">
          How to use a token
          <span className="ml-2 font-normal text-muted-foreground group-open:hidden">Show</span>
        </summary>
        <div className="mt-3 flex flex-col gap-3 text-[13px] leading-relaxed text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">shadcn CLI</p>
            <pre className="mt-1.5 overflow-x-auto rounded-md bg-background px-3 py-2 text-[12px]">
              {`npx shadcn@latest add "https://${BRAND.registryHost}/r/<author>/<component>?token=nxs_…"`}
            </pre>
          </div>
          <div>
            <p className="font-medium text-foreground">MCP (Claude Code, Cursor, Windsurf)</p>
            <pre className="mt-1.5 overflow-x-auto rounded-md bg-background px-3 py-2 text-[12px]">
              {JSON.stringify(
                {
                  mcpServers: {
                    [BRAND.name.toLowerCase()]: {
                      type: "http",
                      url: `https://${BRAND.domain}/api/mcp`,
                      headers: { Authorization: "Bearer nxs_…" },
                    },
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </details>
    </div>
  )
}

function FreshToken({
  name,
  token,
  onDismiss,
}: {
  name: string
  token: string
  onDismiss: () => void
}) {
  const [copied, setCopied] = React.useState(false)

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
      <p className="text-[13px] font-medium">Copy “{name}” now</p>
      <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
        This is the only time it is shown — we store a hash, not the token.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto rounded-md bg-background px-3 py-2 font-mono text-[12px]">
          {token}
        </code>
        <Button
          type="button"
          variant="secondary"
          className="gap-2"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(token)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch {
              toast.error("Could not reach the clipboard. Select the token and copy it manually.")
            }
          }}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDismiss}>
          Done
        </Button>
      </div>
    </div>
  )
}

function TokenList({
  tokens,
  onRevoke,
}: {
  tokens: TokenSummary[]
  onRevoke: (token: TokenSummary) => void
}) {
  if (tokens.length === 0) {
    return (
      <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <KeyRound className="size-4" />
        No tokens yet.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {tokens.map((token) => (
        <li key={token.id} className="flex flex-wrap items-center gap-3 px-3.5 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{token.name}</p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {token.prefix}…{" · "}
              {token.lastUsedAt
                ? `last used ${relative(token.lastUsedAt)}`
                : "never used"}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-destructive"
            onClick={() => onRevoke(token)}
          >
            <Trash2 className="size-4" />
            Revoke
          </Button>
        </li>
      ))}
    </ul>
  )
}

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}
