"use client"

import * as React from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"

/**
 * Shown when a route throws during render.
 *
 * `digest` is the only detail worth putting on screen: Next replaces the real
 * message with it in production precisely so a stack trace never reaches a
 * stranger, and it is the string that ties what the person saw to the line in
 * the server log. Asking someone to quote it is the difference between a bug
 * report you can act on and "it broke".
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Reaches Sentry when a DSN is configured, and the browser console
    // otherwise, so the failure is never silent either way.
    console.error("[render]", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="font-mono text-[13px] text-muted-foreground">Error</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          Something broke on our side
        </h1>
        <p className="mt-4 max-w-md text-[15px] text-muted-foreground">
          Not something you did. Try again — and if it keeps happening, telling us the reference
          below means we can find exactly what went wrong.
        </p>

        {error.digest && (
          <p className="mt-6 rounded-lg border border-border bg-card px-3 py-2 font-mono text-[13px] text-muted-foreground">
            {error.digest}
          </p>
        )}

        <div className="mt-8 flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
