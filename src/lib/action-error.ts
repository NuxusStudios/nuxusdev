/**
 * Recognises a server action that no longer exists.
 *
 * Deploying replaces every action id. A browser holding the old page keeps
 * calling the old id, and the framework rejects that request before any of our
 * code runs — so a handler without a catch leaves the button spinning forever
 * with nothing on screen. Anyone who left a tab open across a deploy hits it,
 * which on a checkout page means a customer who cannot pay us.
 */
export function isStaleDeployment(error: unknown): boolean {
  const message =
    error instanceof Error ? `${error.message} ${error.name}` : String(error ?? "")

  return (
    /Failed to find Server Action/i.test(message) ||
    /older or newer deployment/i.test(message)
  )
}

/** What to show the reader when an action throws rather than returning. */
export function actionErrorMessage(error: unknown, fallback: string): string {
  if (isStaleDeployment(error)) {
    return "This page was loaded before the last update. Reload and try again."
  }
  return fallback
}
