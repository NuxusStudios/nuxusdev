"use client"

import * as React from "react"
import { ArrowUpRight, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EcosystemResult {
  namespace: string
  name: string
  title: string
  description: string
  categories: string[]
  homepage: string | null
  install: string
  status: string
}

/**
 * Components from other people's registries.
 *
 * The install command is the payload — it points at the origin registry, so
 * copying it is not copying anyone's source, and nothing here is plan-gated.
 */
export function EcosystemResults({ results }: { results: EcosystemResult[] }) {
  return (
    <ul className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {results.map((result) => (
        <ResultCard key={`${result.namespace}/${result.name}`} result={result} />
      ))}
    </ul>
  )
}

function ResultCard({ result }: { result: EcosystemResult }) {
  const [copied, setCopied] = React.useState(false)

  return (
    <li className="flex flex-col rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-[15px] font-semibold">{result.title}</h3>
        {result.status !== "healthy" && (
          <span
            className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[11px] text-amber-600 dark:text-amber-400"
            title={`The upstream index reports this registry as ${result.status}`}
          >
            {result.status}
          </span>
        )}
      </div>

      <code className="mt-1 truncate font-mono text-[12px] text-muted-foreground">
        {result.namespace}/{result.name}
      </code>

      {result.description && (
        <p className="mt-2 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
          {result.description}
        </p>
      )}

      <div className="mt-auto flex items-center gap-2 pt-5">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="gap-2"
          title={result.install}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(result.install)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch {
              /* the command is visible in the tooltip */
            }
          }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy install"}
        </Button>

        {result.homepage && (
          <a
            href={result.homepage}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={cn(
              "group inline-flex items-center gap-1 text-[13px] text-muted-foreground",
              "transition-colors hover:text-foreground"
            )}
          >
            Registry
            <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        )}
      </div>
    </li>
  )
}
