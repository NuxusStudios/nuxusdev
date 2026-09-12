"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Loader2, Lock, ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { buyTemplate } from "@/server/actions/template-checkout"
import type { TemplateAccess } from "@/server/templates"

/**
 * The call to action for a single template.
 *
 * Four states, because "buy" is only one of them: it may be free, already
 * included in a plan, already bought, or for sale. Showing a price to someone
 * who already owns the thing is the kind of detail that loses trust.
 */
export function TemplateBuyButton({
  slug,
  price,
  access,
  signedIn,
}: {
  slug: string
  /** whole dollars, from the catalogue */
  price: number
  access: TemplateAccess
  signedIn: boolean
}) {
  const [pending, setPending] = React.useState(false)

  if (access === "free") {
    return (
      <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
        <Check className="size-4 text-emerald-500" />
        Free to use
      </span>
    )
  }

  if (access === "included") {
    return (
      <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
        <Check className="size-4 text-emerald-500" />
        Included with your plan
      </span>
    )
  }

  if (access === "purchased") {
    return (
      <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
        <Check className="size-4 text-emerald-500" />
        You own this template
      </span>
    )
  }

  if (!signedIn) {
    return (
      <Button asChild className="gap-2">
        <Link href={`/sign-in?next=/templates/${slug}`}>
          <Lock className="size-4" />
          Sign in to buy — ${price}
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        className="gap-2"
        disabled={pending}
        onClick={async () => {
          setPending(true)
          const result = await buyTemplate(slug)

          if (!result.ok) {
            setPending(false)
            toast.error(result.error)
            return
          }

          // Stripe hosts the payment page; we never see card details
          window.location.href = result.data.url
        }}
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ShoppingCart className="size-4" />}
        Buy now — ${price}
      </Button>

      <span className="text-[13px] text-muted-foreground">
        or{" "}
        <Link href="/pricing" className="text-foreground underline underline-offset-4">
          get every template with a plan
        </Link>
      </span>
    </div>
  )
}
