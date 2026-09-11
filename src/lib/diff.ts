/**
 * A unified diff, without a dependency.
 *
 * Classic Myers-style LCS over lines. Components are a few hundred lines at
 * most, so the O(n·m) table is a few hundred thousand cells in the worst case —
 * far cheaper than pulling in a diff library for one endpoint.
 */

export interface DiffStats {
  added: number
  removed: number
  /** true when the two inputs are identical */
  identical: boolean
}

export interface DiffResult extends DiffStats {
  /** unified diff text, empty when identical */
  patch: string
}

const MAX_LINES = 4000

export function diffLines(before: string, after: string, context = 3): DiffResult {
  const a = split(before)
  const b = split(after)

  if (a.length > MAX_LINES || b.length > MAX_LINES) {
    return {
      patch: "",
      added: 0,
      removed: 0,
      identical: before === after,
    }
  }

  const ops = backtrack(a, b, lcs(a, b))
  const added = ops.filter((op) => op.kind === "+").length
  const removed = ops.filter((op) => op.kind === "-").length

  if (added === 0 && removed === 0) {
    return { patch: "", added: 0, removed: 0, identical: true }
  }

  return { patch: unified(ops, context), added, removed, identical: false }
}

function split(text: string): string[] {
  // trailing newline shouldn't register as a changed line
  return text.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n")
}

/** Length table of the longest common subsequence. */
function lcs(a: string[], b: string[]): Uint32Array[] {
  const table: Uint32Array[] = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1))

  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }

  return table
}

interface Op {
  kind: " " | "-" | "+"
  text: string
  /** 1-based line number in the "before" file, for hunk headers */
  aLine: number
  bLine: number
}

function backtrack(a: string[], b: string[], table: Uint32Array[]): Op[] {
  const ops: Op[] = []
  let i = 0
  let j = 0

  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ kind: " ", text: a[i], aLine: i + 1, bLine: j + 1 })
      i++
      j++
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      ops.push({ kind: "-", text: a[i], aLine: i + 1, bLine: j + 1 })
      i++
    } else {
      ops.push({ kind: "+", text: b[j], aLine: i + 1, bLine: j + 1 })
      j++
    }
  }

  while (i < a.length) ops.push({ kind: "-", text: a[i], aLine: ++i, bLine: j + 1 })
  while (j < b.length) ops.push({ kind: "+", text: b[j], aLine: i + 1, bLine: ++j })

  return ops
}

/** Renders the changed regions with `context` lines either side. */
function unified(ops: Op[], context: number): string {
  const keep = new Set<number>()

  ops.forEach((op, index) => {
    if (op.kind === " ") return
    for (let k = Math.max(0, index - context); k <= Math.min(ops.length - 1, index + context); k++) {
      keep.add(k)
    }
  })

  const lines: string[] = []
  let index = 0

  while (index < ops.length) {
    if (!keep.has(index)) {
      index++
      continue
    }

    // collect one contiguous hunk
    const start = index
    while (index < ops.length && keep.has(index)) index++
    const hunk = ops.slice(start, index)

    const aStart = hunk.find((op) => op.kind !== "+")?.aLine ?? hunk[0].aLine
    const bStart = hunk.find((op) => op.kind !== "-")?.bLine ?? hunk[0].bLine
    const aCount = hunk.filter((op) => op.kind !== "+").length
    const bCount = hunk.filter((op) => op.kind !== "-").length

    lines.push(`@@ -${aStart},${aCount} +${bStart},${bCount} @@`)
    for (const op of hunk) lines.push(`${op.kind}${op.text}`)
  }

  return lines.join("\n")
}
