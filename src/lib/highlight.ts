import "server-only"
import { createHighlighter, type Highlighter } from "shiki"

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: ["github-dark-default"],
    langs: ["tsx", "ts", "bash", "json", "css"],
  })
  return highlighterPromise
}

export async function highlight(code: string, lang = "tsx"): Promise<string> {
  const highlighter = await getHighlighter()
  return highlighter.codeToHtml(code, {
    lang,
    theme: "github-dark-default",
    transformers: [
      {
        pre(node) {
          node.properties.class = "shiki-pre"
          node.properties.style = ""
        },
        line(node, line) {
          node.properties["data-line"] = String(line)
        },
      },
    ],
  })
}
