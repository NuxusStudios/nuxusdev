"use client"

import * as React from "react"

/**
 * Whether this browser can do WebAuthn.
 *
 * Read through `useSyncExternalStore` rather than set from an effect. The value
 * lives outside React and never changes for the life of the page, but the
 * server has no `window` at all — so it needs a server snapshot, and returning
 * `false` there means the passkey affordance appears after hydration rather
 * than vanishing, which is the harmless direction for a layout shift.
 *
 * Setting it from an effect instead would work and would also trip the compiler
 * lint that exists to stop exactly that cascade.
 */

/** Support never changes after load, so nothing ever needs to be notified. */
const subscribe = () => () => {}

export function usePasskeySupport(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => typeof window.PublicKeyCredential === "function",
    () => false,
  )
}
