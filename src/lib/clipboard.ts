/**
 * Writing to the clipboard after an await.
 *
 * A clipboard write must happen while the browser still considers a user
 * gesture active. Awaiting a network round-trip first spends that activation,
 * and Safari then refuses the write — the button looks broken even though the
 * request succeeded. Chrome is lenient about it, which is why this only shows
 * up for some people.
 *
 * The fix is to hand the clipboard a promise synchronously, inside the
 * gesture, and let it resolve later. Everything after that is a fallback for
 * browsers that don't take one.
 */

/** Old-school copy: a hidden textarea and execCommand, no permission needed. */
function legacyCopy(text: string): boolean {
  if (typeof document === "undefined") return false

  const area = document.createElement("textarea")
  area.value = text
  // keep it out of view without display:none, which is not selectable
  area.setAttribute("readonly", "")
  area.style.position = "fixed"
  area.style.top = "-1000px"
  area.style.opacity = "0"

  document.body.appendChild(area)

  try {
    area.select()
    area.setSelectionRange(0, text.length)
    return document.execCommand("copy")
  } catch {
    return false
  } finally {
    document.body.removeChild(area)
  }
}

/**
 * Copies text that isn't known yet.
 *
 * Pass the promise, not the resolved string — that is the whole point. Call it
 * directly in the click handler, before awaiting anything else.
 */
export async function copyFromPromise(text: Promise<string>): Promise<boolean> {
  // Any path below may abandon this promise — the clipboard can reject before
  // it settles, and the caller reports the failure itself. Attaching a handler
  // now keeps an abandoned rejection from surfacing as an unhandled one and
  // filling the console with an error somebody already dealt with.
  void text.catch(() => {})

  // the gesture-preserving path: the write is queued now, filled in later
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      const blob = text.then((value) => new Blob([value], { type: "text/plain" }))
      void blob.catch(() => {})

      await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })])
      return true
    } catch {
      // Chrome only took promises here recently; fall through and try plainly
    }
  }

  let resolved: string
  try {
    resolved = await text
  } catch {
    // the caller's request failed; it reports that itself
    return false
  }

  try {
    await navigator.clipboard.writeText(resolved)
    return true
  } catch {
    return legacyCopy(resolved)
  }
}

/** Copies text already in hand. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return legacyCopy(text)
  }
}
