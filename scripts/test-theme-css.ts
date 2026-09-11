import { parseThemeCss, renderThemeCss, isSafeValue } from "@/lib/theme-css"

let failures = 0
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) { failures++; console.log(`FAIL ${label}\n  got:      ${JSON.stringify(actual)}\n  expected: ${JSON.stringify(expected)}`) }
  else console.log(`ok   ${label}`)
}

// 1. a real shadcn globals.css paste
const real = `
@layer base {
  :root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    --radius: 0.625rem;
    --chart-1: oklch(0.646 0.222 41.116);
  }
  .dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
  }
}`
const parsed = parseThemeCss(real)
check("light vars", parsed.light, {
  "--background": "oklch(1 0 0)",
  "--foreground": "oklch(0.145 0 0)",
  "--primary": "oklch(0.205 0 0)",
  "--radius": "0.625rem",
})
check("dark vars", parsed.dark, { "--background": "oklch(0.145 0 0)", "--foreground": "oklch(0.985 0 0)" })
check("ignored", parsed.ignored, ["--chart-1"])

// 2. a bare declaration list with no selector
check("bare list", parseThemeCss("--primary: #ff0000; --radius: 8px;").light, {
  "--primary": "#ff0000", "--radius": "8px",
})

// 3. hsl triplets, the older shadcn format
check("hsl triplet", parseThemeCss(":root{--primary: 222.2 47.4% 11.2%;}").light, {
  "--primary": "222.2 47.4% 11.2%",
})

// 4. injection attempts must all be dropped
const attacks: [string, string][] = [
  ["closing brace", "--primary: red} body{display:none"],
  ["url()", "--primary: url(https://evil.test/x.png)"],
  ["javascript url", "--primary: url(javascript:alert(1))"],
  ["image-set", "--background: image-set('a.png' 1x)"],
  ["expression", "--primary: expression(alert(1))"],
  ["quote", "--primary: \"red\""],
  ["semicolon smuggle", "--primary: red; background: url(x)"],
  ["html", "--primary: <script>alert(1)</script>"],
  ["var indirection", "--primary: var(--secret)"],
  ["unbalanced paren", "--primary: rgb(1,2,3"],
  ["comment escape", "--primary: red/*}*/"],
  ["very long", "--primary: " + "a".repeat(200)],
]
// the property that matters is that nothing dangerous survives into the
// rendered CSS — the parser is allowed to keep the safe half of a smuggle.
// Only the declaration bodies are checked: our own selectors legitimately
// contain quotes and brackets.
function bodies(css: string): string {
  return [...css.matchAll(/\{([^{}]*)\}/g)].map((m) => m[1]).join(";")
}

for (const [label, decl] of attacks) {
  const css = renderThemeCss(parseThemeCss(`:root{${decl};}`))
  const body = bodies(css)
  const escaped =
    body.includes("url(") ||
    body.includes("<") ||
    body.includes(">") ||
    body.includes("expression") ||
    body.includes("var(") ||
    body.includes('"') ||
    body.includes("'") ||
    body.includes("/*") ||
    body.includes("{") ||
    body.includes("}") ||
    // every brace in the output must be one we opened, and all balanced
    (css.match(/\{/g) ?? []).length !== (css.match(/\}/g) ?? []).length ||
    (css.match(/\{/g) ?? []).length > 2
  check(`blocks ${label}`, escaped, false)
}

// and the safe half of a smuggled declaration is kept, not mangled
check("keeps safe half of smuggle", parseThemeCss(":root{--primary: red; background: url(x);}").light, {
  "--primary": "red",
})
check("strips comment from value", parseThemeCss(":root{--primary: red/*}*/;}").light, {
  "--primary": "red",
})

// 5. rendered output must never contain a brace inside a value
const rendered = renderThemeCss(parseThemeCss(real))
check("renders both blocks", rendered.includes(":root,:root.light{") && rendered.includes(':root.dark,:root[data-theme="dark"]{'), true)
check("no stray braces", (rendered.match(/\{/g) ?? []).length, 2)

// 6. values that should pass
for (const good of ["#fff", "rgb(1 2 3)", "oklch(0.5 0.1 200 / 50%)", "calc(1rem + 2px)", "0.5rem", "color-mix(in oklab, red, blue)"]) {
  check(`allows ${good}`, isSafeValue(good), true)
}

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
