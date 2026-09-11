"use server"

import { getEntitlements } from "@/server/entitlements"

/**
 * The client needs to know whether to show a lock icon. It is a display hint
 * only — every gated payload is still checked on the server when it is
 * requested, so tampering with this response gains nothing.
 */
export async function readEntitlements() {
  const entitlements = await getEntitlements()
  return {
    signedIn: entitlements.signedIn,
    canCopy: entitlements.canCopy,
    planId: entitlements.plan.id,
    planName: entitlements.plan.name,
    reason: entitlements.reason,
  }
}
