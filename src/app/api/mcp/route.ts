import { NextResponse } from "next/server"
import { COMPONENTS } from "@/lib/data/components"
import { getAuthor } from "@/lib/data/authors"
import { TAGS, TAG_MAP } from "@/lib/data/tags"
import { queryComponents } from "@/lib/queries"
import { readComponentSource, readDemoSource } from "@/lib/source"
import { buildPrompt } from "@/lib/prompt"
import { tokenFromRequest, verifyToken, type TokenBearer } from "@/server/tokens"
import { enforceRateLimit, RateLimitError } from "@/server/rate-limit"
import { BRAND } from "@/lib/brand"
import { diffLines } from "@/lib/diff"
import { contentVersion } from "@/lib/version"
import { ecosystemStats, searchEcosystem } from "@/server/ecosystem"

/**
 * MCP server (JSON-RPC 2.0 over HTTP).
 *
 * Lets a coding agent search the registry and pull a component's source
 * directly, rather than the human copying a prompt across. Searching and
 * reading metadata are open; anything that returns source requires a plan,
 * exactly like the website.
 *
 * Connect with a personal access token from /settings:
 *   { "url": "https://nuxus.dev/api/mcp", "headers": { "Authorization": "Bearer nxs_…" } }
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PROTOCOL_VERSION = "2025-06-18"

interface RpcRequest {
  jsonrpc: "2.0"
  id?: string | number | null
  method: string
  params?: Record<string, unknown>
}

const TOOLS = [
  {
    name: "search_components",
    description:
      "Search the registry for React components by keyword, category or author. Returns names, descriptions and ids — not source.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text, e.g. 'animated hero' or 'pricing table'" },
        category: {
          type: "string",
          description: `Optional category slug, e.g. ${TAGS.slice(0, 6).map((t) => t.slug).join(", ")}`,
        },
        limit: { type: "number", description: "Maximum results, 1-40 (default 10)" },
      },
    },
  },
  {
    name: "get_component",
    description:
      "Fetch a component's full source, demo and install instructions, ready to write into a project. Requires a paid plan.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Component id from search_components, e.g. 'c-003'" },
      },
      required: ["id"],
    },
  },
  {
    name: "list_categories",
    description: "List every component category with how many components each holds.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "check_component",
    description:
      "Given the current contents of a component file in the project, report whether it still matches the registry version. Use this to find components that have been fixed upstream since they were copied. Returns a verdict and a summary, not the source, so it needs no plan.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Component id, e.g. 'c-003'" },
        source: {
          type: "string",
          description: "The full current contents of the local file for this component",
        },
      },
      required: ["id", "source"],
    },
  },
  {
    name: "diff_component",
    description:
      "Given the current contents of a component file, return a unified diff against the registry's current version, ready to apply as a patch. Requires a paid plan, because the diff contains our source.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Component id, e.g. 'c-003'" },
        source: {
          type: "string",
          description: "The full current contents of the local file for this component",
        },
      },
      required: ["id", "source"],
    },
  },
  {
    name: "search_ecosystem",
    description:
      "Search every public shadcn registry, not just this one — around 37,000 components across 240 registries. Returns the exact `npx shadcn add` command for each, which installs from the origin registry. Free to use: no plan needed, because nothing here is our source to sell.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free text, e.g. 'kanban board' or 'otp input'" },
        limit: { type: "number", description: "Maximum results, 1-40 (default 15)" },
        healthyOnly: {
          type: "boolean",
          description: "Only registries the official index currently reports as healthy",
        },
      },
      required: ["query"],
    },
  },
] as const

export async function POST(request: Request) {
  let body: RpcRequest | RpcRequest[]

  try {
    body = await request.json()
  } catch {
    return rpcError(null, -32700, "Parse error")
  }

  // notifications and batches both arrive here; handle one shape at a time
  const single = Array.isArray(body) ? body[0] : body
  if (!single || single.jsonrpc !== "2.0") {
    return rpcError(null, -32600, "Invalid request")
  }

  const bearer = await verifyToken(tokenFromRequest(request))

  try {
    return await dispatch(single, bearer)
  } catch (error) {
    if (error instanceof RateLimitError) {
      return rpcError(single.id ?? null, -32000, error.message)
    }
    console.error("[mcp] handler failed", error)
    return rpcError(single.id ?? null, -32603, "Internal error")
  }
}

/** A GET makes the endpoint discoverable and explains how to connect. */
export async function GET() {
  return NextResponse.json({
    name: `${BRAND.name} MCP`,
    version: "1.0.0",
    protocol: PROTOCOL_VERSION,
    transport: "http",
    description:
      `Search and install ${COMPONENTS.length} React components from ${BRAND.name}, ` +
      `plus ${ecosystemStats().items.toLocaleString("en-US")} more across every public shadcn registry.`,
    tools: TOOLS.map((tool) => ({ name: tool.name, description: tool.description })),
    authentication: {
      type: "bearer",
      note: `Create a token at https://${BRAND.domain}/settings`,
    },
  })
}

async function dispatch(rpc: RpcRequest, bearer: TokenBearer | null) {
  const id = rpc.id ?? null

  switch (rpc.method) {
    case "initialize":
      return rpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: `${BRAND.name} MCP`, version: "1.0.0" },
        instructions:
          `Search ${BRAND.name} for React components, then call get_component to receive the ` +
          `full source and a prompt describing where the files go. Use search_ecosystem to look ` +
          `across every other public shadcn registry as well — it needs no plan, and returns the ` +
          `command that installs from the origin registry.`,
      })

    case "notifications/initialized":
      return new NextResponse(null, { status: 204 })

    case "ping":
      return rpcResult(id, {})

    case "tools/list":
      return rpcResult(id, { tools: TOOLS })

    case "tools/call":
      return callTool(id, rpc.params ?? {}, bearer)

    default:
      return rpcError(id, -32601, `Unknown method: ${rpc.method}`)
  }
}

async function callTool(
  id: string | number | null,
  params: Record<string, unknown>,
  bearer: TokenBearer | null
) {
  const name = params.name as string
  const args = (params.arguments ?? {}) as Record<string, unknown>

  enforceRateLimit(`mcp:${bearer?.userId ?? "anon"}`, { max: 120, windowSeconds: 60 })

  if (name === "list_categories") {
    // an empty category is noise to an agent — it can only lead to a dead search
    const lines = TAGS.map((tag) => ({ tag, count: queryComponents({ tag: tag.slug }).length }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((entry) => `${entry.tag.slug} — ${entry.tag.name} (${entry.count})`)

    return text(id, `Pass any slug below as the \`category\` argument to search_components.\n\n${lines.join("\n")}`)
  }

  if (name === "check_component" || name === "diff_component") {
    const componentId = typeof args.id === "string" ? args.id : ""
    const local = typeof args.source === "string" ? args.source : ""
    const component = COMPONENTS.find((c) => c.id === componentId)

    if (!component) {
      return text(id, `No component with id "${componentId}". Use search_components first.`)
    }
    if (!local.trim()) {
      return text(id, "Pass the current contents of the local file as `source`.", true)
    }

    const current = await readComponentSource(component.previewKey)

    // the caller's file is diffed and discarded — it is never stored, and it
    // may well be their own modified version rather than ours
    const result = diffLines(local, current)

    if (result.identical) {
      return text(
        id,
        `${component.name} is up to date (version ${contentVersion(current)}). No changes upstream.`
      )
    }

    const summary =
      `${component.name} differs from the registry version ${contentVersion(current)}: ` +
      `${result.added} line${result.added === 1 ? "" : "s"} added, ` +
      `${result.removed} removed.\n\n` +
      `The difference may be an upstream fix, or a change made locally on purpose — ` +
      `read the diff before applying it.`

    if (name === "check_component") {
      return text(id, `${summary}\n\nCall diff_component for the patch.`)
    }

    // the patch contains our source, so it is gated exactly like get_component
    if (!bearer) {
      return text(
        id,
        `${summary}\n\nThe patch itself needs a ${BRAND.name} plan. ` +
          `Create a token at https://${BRAND.domain}/settings.`,
        true
      )
    }
    if (!bearer.canCopy) {
      return text(
        id,
        `${summary}\n\nYour token is on the free plan. ` +
          `The patch requires a plan: https://${BRAND.domain}/pricing`,
        true
      )
    }

    return text(id, `${summary}\n\n\`\`\`diff\n${result.patch}\n\`\`\``)
  }

  if (name === "search_ecosystem") {
    const query = typeof args.query === "string" ? args.query : ""
    const limit = Math.min(Math.max(Number(args.limit) || 15, 1), 40)
    const results = searchEcosystem({ q: query, limit, healthyOnly: args.healthyOnly === true })

    if (results.length === 0) {
      return text(id, `Nothing across the indexed registries matched "${query}".`)
    }

    const lines = results.map((item) =>
      [
        `${item.namespace}/${item.name} — ${item.title}`,
        item.description ? `  ${item.description}` : null,
        item.categories.length ? `  categories: ${item.categories.join(", ")}` : null,
        `  install: ${item.install}`,
        item.status !== "healthy" ? `  note: this registry is currently ${item.status}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    )

    const stats = ecosystemStats()
    return text(
      id,
      `${results.length} of ${stats.items.toLocaleString("en-US")} components across ` +
        `${stats.registries} registries:\n\n${lines.join("\n\n")}\n\n` +
        `These install from their own registries. Add the namespace to components.json first, ` +
        `or run the command as shown.`
    )
  }

  if (name === "search_components") {
    const query = typeof args.query === "string" ? args.query : ""
    const category = typeof args.category === "string" ? args.category : undefined
    const limit = Math.min(Math.max(Number(args.limit) || 10, 1), 40)

    if (category && !TAG_MAP.has(category)) {
      return text(id, `Unknown category "${category}". Call list_categories for valid values.`)
    }

    const results = queryComponents({ q: query, tag: category, sort: "popular", limit })

    if (results.length === 0) {
      return text(id, `No components matched "${query}". Try a broader term or list_categories.`)
    }

    const lines = results.map((component) => {
      const author = getAuthor(component.authorHandle)
      return [
        `id: ${component.id}`,
        `name: ${component.name}`,
        `by: ${author.name} (@${component.authorHandle})`,
        `categories: ${component.tags.join(", ")}`,
        `dependencies: ${component.dependencies.join(", ") || "none"}`,
        `description: ${component.description}`,
        `url: https://${BRAND.domain}/@${component.authorHandle}/components/${component.slug}`,
      ].join("\n")
    })

    return text(
      id,
      `${results.length} result${results.length === 1 ? "" : "s"}:\n\n${lines.join("\n\n")}\n\n` +
        `Call get_component with an id to receive the source.`
    )
  }

  if (name === "get_component") {
    const componentId = typeof args.id === "string" ? args.id : ""
    const component = COMPONENTS.find((c) => c.id === componentId)

    if (!component) {
      return text(id, `No component with id "${componentId}". Use search_components first.`)
    }

    // the paywall applies here exactly as it does in the browser
    if (!bearer) {
      return text(
        id,
        `This tool returns component source, which needs a ${BRAND.name} plan.\n` +
          `Create a token at https://${BRAND.domain}/settings and connect with:\n` +
          `  Authorization: Bearer nxs_…`,
        true
      )
    }

    if (!bearer.canCopy) {
      return text(
        id,
        `Your token is valid but the account is on the free plan. ` +
          `Component source requires a plan: https://${BRAND.domain}/pricing`,
        true
      )
    }

    const [code, demoCode] = await Promise.all([
      readComponentSource(component.previewKey),
      readDemoSource(component.previewKey),
    ])

    return text(id, buildPrompt({ component, code, demoCode }))
  }

  return rpcError(id, -32602, `Unknown tool: ${name}`)
}

function text(id: string | number | null, value: string, isError = false) {
  return rpcResult(id, { content: [{ type: "text", text: value }], isError })
}

function rpcResult(id: string | number | null, result: unknown) {
  return NextResponse.json({ jsonrpc: "2.0", id, result })
}

function rpcError(id: string | number | null, code: number, message: string) {
  return NextResponse.json({ jsonrpc: "2.0", id, error: { code, message } }, { status: 200 })
}
