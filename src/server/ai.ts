import "server-only"
import { env, providers } from "@/server/env"

/**
 * The one place a model is called.
 *
 * Generators go through here so the key never spreads, every call has a
 * timeout and a token ceiling, and the whole feature reports itself
 * unavailable when no key is configured rather than failing halfway through a
 * request that has already taken someone's credits.
 */

const ENDPOINT = "https://api.anthropic.com/v1/messages"
const VERSION = "2023-06-01"
/** cheap and quick; these tasks are structured output, not reasoning */
const MODEL = "claude-haiku-4-5-20251001"
const TIMEOUT_MS = 30_000

export class AiUnavailableError extends Error {
  constructor() {
    super("AI generation isn't configured on this server.")
    this.name = "AiUnavailableError"
  }
}

export class AiFailedError extends Error {
  constructor(message = "The generator didn't return anything usable.") {
    super(message)
    this.name = "AiFailedError"
  }
}

export const aiAvailable = providers.ai

interface AskOptions {
  system: string
  prompt: string
  maxTokens?: number
}

/** Returns the model's text reply, or throws. */
export async function ask({ system, prompt, maxTokens = 1200 }: AskOptions): Promise<string> {
  if (!providers.ai) throw new AiUnavailableError()

  let response: Response
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY!,
        "anthropic-version": VERSION,
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch {
    // a timeout or a network fault, not something the caller can fix
    throw new AiFailedError("The generator timed out. Your credits weren't used.")
  }

  if (!response.ok) {
    // the provider's body can name the key's scope, so it is logged and not returned
    console.error("[ai] request failed", response.status, await response.text().catch(() => ""))
    throw new AiFailedError()
  }

  const payload = (await response.json()) as {
    content?: { type: string; text?: string }[]
  }

  const text = payload.content?.find((block) => block.type === "text")?.text?.trim()
  if (!text) throw new AiFailedError()

  return text
}

/**
 * Pulls the first JSON object out of a reply.
 *
 * Models wrap JSON in prose or a fence often enough that demanding a bare
 * object is a worse experience than reading around it.
 */
export function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : text

  const start = candidate.indexOf("{")
  const end = candidate.lastIndexOf("}")
  if (start === -1 || end <= start) throw new AiFailedError()

  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T
  } catch {
    throw new AiFailedError()
  }
}
