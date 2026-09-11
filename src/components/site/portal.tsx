"use client"

import * as React from "react"
import { createPortal } from "react-dom"

/**
 * Renders children at the end of <body>.
 *
 * Needed because a `fixed` element does not necessarily size against the
 * viewport: any ancestor with a transform, filter, backdrop-filter,
 * perspective, contain or will-change becomes the containing block for its
 * fixed descendants. Both headers here use backdrop-blur, so an overlay
 * rendered inside one collapses to the height of the header — which looks
 * exactly like a broken drawer. Leaving the subtree is the only reliable fix;
 * dropping the blur would just move the trap somewhere else.
 */
/** Never changes, so the store never notifies. */
const noop = () => () => {}

export function Portal({ children }: { children: React.ReactNode }) {
  // a portal needs a DOM target, which the server render has no access to.
  // useSyncExternalStore rather than an effect: the server snapshot is false
  // and the client snapshot true, which is exactly the question being asked,
  // and it keeps the markup the server produced consistent on hydration.
  const onClient = React.useSyncExternalStore(
    noop,
    () => true,
    () => false
  )

  if (!onClient) return null
  return createPortal(children, document.body)
}
