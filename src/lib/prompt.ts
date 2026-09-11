import type { ComponentRecord } from "@/lib/types"
import { BRAND } from "@/lib/brand"

/**
 * One prompt, every tool.
 *
 * There is deliberately no "pick your IDE" step. The prompt describes the files
 * to create and the conventions to respect — which is all any coding agent
 * needs, whether that's Claude Code, Antigravity, Cursor, Codex, Lovable, v0,
 * Bolt or Windsurf. Asking someone to choose a tool before copying is a step
 * that buys nothing.
 */

export interface PromptInput {
  component: ComponentRecord
  code: string
  demoCode: string
}

export function buildPrompt({ component, code, demoCode }: PromptInput): string {
  const deps = component.dependencies.filter(
    (dep) => dep !== "react" && dep !== "react-dom" && dep !== "next"
  )

  return [
    `Add the ${component.name} component to my project.`,
    "",
    `${component.description}`,
    `Source: ${BRAND.domain}/@${component.authorHandle}/components/${component.slug}`,
    "",
    `Create \`components/ui/${component.fileName}\` with exactly this content:`,
    "",
    "```tsx",
    code,
    "```",
    "",
    `Create \`components/${component.demoFileName}\` with exactly this content:`,
    "",
    "```tsx",
    demoCode,
    "```",
    ...(deps.length
      ? ["", "Install the packages it needs:", "", "```bash", `npm install ${deps.join(" ")}`, "```"]
      : []),
    "",
    "Then:",
    "",
    "1. Keep the file paths above — the demo imports the component from `@/components/ui/`.",
    "2. `cn()` comes from `@/lib/utils` (clsx + tailwind-merge). Create it if it doesn't exist.",
    "3. Adapt colours, radii and spacing to the project's existing Tailwind theme rather than introducing new values.",
    "4. Don't rename the exports or change the prop names.",
    "5. If a dependency is already installed at a different version, keep the installed one.",
    "6. Render the demo somewhere I can see it, then tell me where you put it.",
  ].join("\n")
}

export function cliCommand(
  component: ComponentRecord,
  manager: "npm" | "pnpm" | "yarn" | "bun" = "npm"
): string {
  const url = `https://${BRAND.registryHost}/r/${component.authorHandle}/${component.slug}`
  const runner =
    manager === "npm"
      ? "npx"
      : manager === "pnpm"
        ? "pnpm dlx"
        : manager === "yarn"
          ? "yarn dlx"
          : "bunx --bun"
  return `${runner} shadcn@latest add "${url}"`
}
