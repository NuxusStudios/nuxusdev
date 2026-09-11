import { diffLines } from "@/lib/diff"
import { contentVersion } from "@/lib/version"

let failures = 0
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected)
  if (!ok) { failures++; console.log(`FAIL ${label}\n  got:      ${JSON.stringify(actual)}\n  expected: ${JSON.stringify(expected)}`) }
  else console.log(`ok   ${label}`)
}

// identical inputs
const same = diffLines("a\nb\nc", "a\nb\nc")
check("identical", [same.identical, same.added, same.removed, same.patch], [true, 0, 0, ""])

// trailing newline and CRLF must not count as a change
check("ignores trailing newline", diffLines("a\nb", "a\nb\n").identical, true)
check("ignores CRLF", diffLines("a\r\nb", "a\nb").identical, true)

// a single changed line
const one = diffLines("a\nb\nc", "a\nB\nc")
check("one line changed", [one.added, one.removed, one.identical], [1, 1, false])
check("patch has both sides", one.patch.includes("-b") && one.patch.includes("+B"), true)

// pure insertion
const ins = diffLines("a\nc", "a\nb\nc")
check("insertion", [ins.added, ins.removed], [1, 0])

// pure deletion
const del = diffLines("a\nb\nc", "a\nc")
check("deletion", [del.added, del.removed], [0, 1])

// context: an unchanged line far away is excluded from the hunk
const far = diffLines(
  ["1","2","3","4","5","6","7","8","9","10"].join("\n"),
  ["1","2","3","4","CHANGED","6","7","8","9","10"].join("\n")
)
check("hunk excludes distant lines", far.patch.includes("1\n") && far.patch.includes(" 10"), false)
check("hunk includes near context", far.patch.includes(" 4") && far.patch.includes(" 6"), true)
check("hunk header present", /^@@ -\d+,\d+ \+\d+,\d+ @@/m.test(far.patch), true)

// a realistic component edit
const before = `export function Button({ children }) {
  return (
    <button className="rounded bg-white px-4 py-2 text-black">
      {children}
    </button>
  )
}`
const after = `export function Button({ children }) {
  return (
    <button className="rounded bg-primary px-4 py-2 text-primary-foreground focus-visible:ring-2">
      {children}
    </button>
  )
}`
const real = diffLines(before, after)
check("component edit", [real.added, real.removed, real.identical], [1, 1, false])

// two separate hunks
const two = diffLines(
  ["a","b","c","d","e","f","g","h","i","j","k","l"].join("\n"),
  ["A","b","c","d","e","f","g","h","i","j","k","L"].join("\n")
)
check("two hunks", (two.patch.match(/^@@/gm) ?? []).length, 2)

// empty inputs
check("both empty", diffLines("", "").identical, true)
check("empty to content", diffLines("", "x").added, 1)

// version hashing
check("version stable", contentVersion("a\nb") === contentVersion("a\nb"), true)
check("version ignores trailing ws", contentVersion("a  \nb") === contentVersion("a\nb"), true)
check("version ignores CRLF", contentVersion("a\r\nb") === contentVersion("a\nb"), true)
check("version changes on edit", contentVersion("a\nb") === contentVersion("a\nB"), false)
check("version length", contentVersion("x").length, 12)

// performance guard: a large file returns no patch rather than hanging
const big = Array.from({ length: 5000 }, (_, i) => `line ${i}`).join("\n")
const guarded = diffLines(big, big + "\nextra")
check("oversize guarded", guarded.patch, "")

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
