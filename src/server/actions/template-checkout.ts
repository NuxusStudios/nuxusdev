"use server"

import { z } from "zod"
import { requireUser } from "@/server/session"
import { enforceRateLimit } from "@/server/rate-limit"
import { run, ValidationError } from "@/server/actions/result"
import { providers } from "@/server/env"
import { stripe } from "@/server/stripe"
import { customerIdFor, siteOrigin } from "@/server/billing-shared"
import { getTemplateStatus } from "@/server/templates"
import { TEMPLATE_MAP } from "@/lib/data/templates"
import { BRAND } from "@/lib/brand"

/**
 * One-off template purchase.
 *
 * Separate from plan checkout because it is a different kind of sale: a single
 * payment for a single thing, kept forever, rather than access that lapses.
 *
 * The price is read from the catalogue on the server. The browser names the
 * template and nothing else — a client that could name the amount could name
 * zero.
 */

const schema = z.object({ slug: z.string().trim().min(1).max(120) })

export async function buyTemplate(slug: string) {
  return run(async () => {
    const user = await requireUser()

    if (!providers.billing) throw new ValidationError("Billing isn't configured yet.")

    enforceRateLimit(`template:buy:${user.id}`, { max: 15, windowSeconds: 600 })

    const parsed = schema.safeParse({ slug })
    if (!parsed.success) throw new ValidationError("That template isn't available.")

    const template = TEMPLATE_MAP.get(parsed.data.slug)
    if (!template) throw new ValidationError("That template isn't available.")
    if (template.price <= 0) throw new ValidationError("That template is already free.")

    // refuse to sell something they can already open, by either route
    const status = await getTemplateStatus(template.slug)
    if (status.canOpen) {
      throw new ValidationError(
        status.access === "included"
          ? "Your plan already includes this template."
          : "You already own this template."
      )
    }

    const customer = await customerIdFor({
      id: user.id,
      email: user.email,
      name: user.name ?? user.email,
    })

    const origin = siteOrigin()

    const session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        customer,

        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "usd",
              // catalogue price, in cents, resolved server-side
              unit_amount: Math.round(template.price * 100),
              product_data: {
                name: `${template.name} — ${BRAND.name} template`,
                description: template.description.slice(0, 300),
              },
            },
          },
        ],

        // two independent ways for the webhook to find the buyer and the item
        client_reference_id: user.id,
        metadata: { userId: user.id, kind: "template", templateSlug: template.slug },
        payment_intent_data: {
          metadata: { userId: user.id, kind: "template", templateSlug: template.slug },
        },

        success_url: `${origin}/templates/${template.slug}?purchase=success`,
        cancel_url: `${origin}/templates/${template.slug}?purchase=cancelled`,

        allow_promotion_codes: true,
        billing_address_collection: "auto",
      },
      // A double-clicked button must not charge twice. Scoped to a minute for
      // the same reason as plan checkout: a key that never changes is refused
      // for 24 hours as soon as anything about the request does, and a buyer
      // who was refunded could never buy the same template again.
      { idempotencyKey: `template:${user.id}:${template.slug}:${Math.floor(Date.now() / 60_000)}` }
    )

    if (!session.url) throw new ValidationError("Stripe did not return a checkout URL.")

    return { url: session.url }
  })
}
