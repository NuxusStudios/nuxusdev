import Link from "next/link"
import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { BRAND } from "@/lib/brand"
import { COMPONENTS } from "@/lib/data/components"

export const metadata: Metadata = {
  title: "Docs",
  description: `How to use ${BRAND.name}: copy a prompt, install with the shadcn CLI, or connect the MCP server so your agent installs components itself.`,
}

const SECTIONS = [
  { id: "prompt", label: "Copy a prompt" },
  { id: "cli", label: "shadcn CLI" },
  { id: "mcp", label: "MCP server" },
  { id: "tokens", label: "Access tokens" },
  { id: "publishing", label: "Publishing" },
]

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-page py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_13rem]">
          <div className="min-w-0 max-w-2xl">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Docs</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
              Three ways to get a component out of {BRAND.name} and into your project. All of them
              need a plan — browsing and previewing are free.
            </p>

            <Section id="prompt" title="Copy a prompt">
              <p>
                Open any component and press <strong>Copy prompt</strong>. You get one block of
                text containing the source, the demo, and the instructions needed to land both in
                your codebase.
              </p>
              <p>
                There is no tool picker. The same prompt works in Claude Code, Cursor, Codex,
                Antigravity, Lovable, v0, Bolt and Windsurf — paste it and the tool writes the
                files, then adapts the colours and spacing to the theme you already have.
              </p>
            </Section>

            <Section id="cli" title="shadcn CLI">
              <p>
                Every component is also served in{" "}
                <a
                  href="https://ui.shadcn.com/docs/registry/registry-item-json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4"
                >
                  registry-item.json
                </a>{" "}
                format, so the shadcn CLI can install it directly:
              </p>
              <CodeBlock
                language="bash"
                code={`npx shadcn@latest add "https://${BRAND.registryHost}/r/nova/shimmer-button?token=YOUR_TOKEN"`}
              />
              <p>
                The registry returns source, so it is gated like everything else. Without a token
                it answers <code>401</code>; with a token on the free plan, <code>402</code>.
                Create one under <Link href="/settings">Settings</Link>.
              </p>
            </Section>

            <Section id="mcp" title="MCP server">
              <p>
                The MCP server lets an agent search {BRAND.name} and install a component without
                you copying anything across. Point your client at{" "}
                <code>https://{BRAND.domain}/api/mcp</code>:
              </p>
              <CodeBlock
                language="json"
                code={JSON.stringify(
                  {
                    mcpServers: {
                      nuxus: {
                        type: "http",
                        url: `https://${BRAND.domain}/api/mcp`,
                        headers: { Authorization: "Bearer nxs_YOUR_TOKEN" },
                      },
                    },
                  },
                  null,
                  2
                )}
              />
              <p>It exposes three tools:</p>
              <ul className="ml-5 list-disc space-y-2">
                <li>
                  <code>search_components</code> — search all {COMPONENTS.length} components by
                  keyword or category. Returns names and descriptions, never source.
                </li>
                <li>
                  <code>get_component</code> — the full source, demo and install notes for one
                  component. Requires a plan.
                </li>
                <li>
                  <code>list_categories</code> — every category with a component count.
                </li>
              </ul>
              <p>
                Searching works without a token, so an agent can explore the catalogue and tell you
                what it found before you pay for anything.
              </p>
            </Section>

            <Section id="tokens" title="Access tokens">
              <p>
                A browser carries a session cookie; a terminal does not. Tokens are the machine
                equivalent, and they resolve to the same plan your account has — so a token cannot
                be used to get around the paywall, and a cancelled plan stops working immediately.
              </p>
              <p>
                Create one under <Link href="/settings">Settings</Link>. It is shown once, because
                we store a hash rather than the token itself. If you lose it, revoke it and make
                another. Treat it like a password: anyone holding it can install components as you.
              </p>
            </Section>

            <Section id="publishing" title="Publishing">
              <p>
                Publish your own components from <Link href="/publish">the publish page</Link>.
                Paste the component and a demo that renders it, pick categories, and it appears on
                your profile at <code>/@yourhandle</code> and in the registry.
              </p>
              <p>
                Published components are served through the same registry and MCP endpoints as
                everything else, so they install the same way.
              </p>
            </Section>
          </div>

          <nav className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-[13px] font-medium">On this page</p>
              <ul className="mt-3 flex flex-col gap-2 border-l border-border">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="-ml-px block border-l border-transparent pl-3 text-[13px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}

/** Docs snippets aren't component source, so they need no copy gate. */
function CodeBlock({ code }: { language?: string; code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 font-mono text-[13px] leading-relaxed text-foreground">
      {code}
    </pre>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-24 border-t border-border pt-10">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 flex flex-col gap-4 text-[15px] leading-relaxed text-muted-foreground [&_a:not([class])]:text-foreground [&_a:not([class])]:underline [&_a:not([class])]:underline-offset-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] [&_strong]:font-medium [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  )
}
