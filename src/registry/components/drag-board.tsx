"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface BoardCard {
  id: string
  title: string
  meta?: string
  flagged?: boolean
}

export interface BoardColumn {
  id: string
  title: string
  cards: BoardCard[]
}

export const BOARD_COLUMNS: BoardColumn[] = [
  {
    id: "triage",
    title: "Triage",
    cards: [
      { id: "t1", title: "Rate limiter drops burst traffic", meta: "infra · 2d", flagged: true },
      { id: "t2", title: "Sign-in copy says “e-mail”", meta: "content" },
      { id: "t3", title: "Stale avatars after rename", meta: "api · 5d" },
    ],
  },
  {
    id: "building",
    title: "Building",
    cards: [
      { id: "b1", title: "Split the settings route", meta: "web · 1d" },
      { id: "b2", title: "Token budget per workspace", meta: "billing · 3d" },
    ],
  },
  {
    id: "review",
    title: "Review",
    cards: [{ id: "r1", title: "Retry policy for webhooks", meta: "api · 4h" }],
  },
  {
    id: "shipped",
    title: "Shipped",
    cards: [
      { id: "s1", title: "Keyboard traps in the drawer", meta: "a11y" },
      { id: "s2", title: "Cold start on the edge worker", meta: "infra" },
    ],
  },
]

/** Pointer travel before a press becomes a drag rather than a click. */
const SLOP = 5

interface Snapshot {
  columns: { id: string; rect: DOMRect }[]
  /** Vertical midpoint of every card, so a drop index is one comparison. */
  mids: Record<string, number[]>
}

/**
 * A board you can rearrange with a pointer or with the keyboard alone.
 *
 * Column and card geometry is measured once at drag start rather than per move.
 * Reading a rect mid-drag forces layout on every pointer event, and the numbers
 * are wrong anyway — the drop indicator has already reflowed the column you are
 * measuring, so the card midpoints shift under the cursor as you approach them.
 *
 * The keyboard path is not a fallback bolted on afterwards: arrow keys move a
 * focused card between and within columns, and each move is announced, so the
 * board is fully operable without ever starting a drag.
 */
export function DragBoard({
  columns: initial = BOARD_COLUMNS,
  className,
}: {
  columns?: BoardColumn[]
  className?: string
}) {
  const [columns, setColumns] = React.useState(initial)
  const [drag, setDrag] = React.useState<{ cardId: string; from: string } | null>(null)
  const [drop, setDrop] = React.useState<{ col: string; index: number } | null>(null)
  const [note, setNote] = React.useState("")

  const columnEls = React.useRef(new Map<string, HTMLElement>())
  const cardEls = React.useRef(new Map<string, HTMLElement>())
  const snapshot = React.useRef<Snapshot | null>(null)
  const press = React.useRef({ cardId: "", from: "", x: 0, y: 0, live: false })
  const dragRef = React.useRef<{ cardId: string; from: string } | null>(null)
  const dropRef = React.useRef<{ col: string; index: number } | null>(null)
  const refocus = React.useRef<string | null>(null)

  // Keyboard moves rebuild the card, so focus has to be put back by hand.
  React.useEffect(() => {
    if (!refocus.current) return
    cardEls.current.get(refocus.current)?.focus()
    refocus.current = null
  })

  const move = React.useCallback(
    (cardId: string, toCol: string, toIndex: number) => {
      setColumns((prev) => {
        const from = prev.find((c) => c.cards.some((card) => card.id === cardId))
        const card = from?.cards.find((c) => c.id === cardId)
        if (!from || !card) return prev

        const sameColumn = from.id === toCol
        const oldIndex = from.cards.indexOf(card)
        // Removing first shifts everything after it, so a downward move within
        // one column has to aim one slot earlier than the raw drop index.
        const landing = sameColumn && toIndex > oldIndex ? toIndex - 1 : toIndex

        return prev.map((column) => {
          if (column.id === from.id && sameColumn) {
            const rest = column.cards.filter((c) => c.id !== cardId)
            rest.splice(Math.min(landing, rest.length), 0, card)
            return { ...column, cards: rest }
          }
          if (column.id === from.id) {
            return { ...column, cards: column.cards.filter((c) => c.id !== cardId) }
          }
          if (column.id === toCol) {
            const rest = [...column.cards]
            rest.splice(Math.min(landing, rest.length), 0, card)
            return { ...column, cards: rest }
          }
          return column
        })
      })

      const to = columns.find((c) => c.id === toCol)
      const card = columns.flatMap((c) => c.cards).find((c) => c.id === cardId)
      if (to && card) setNote(`${card.title} moved to ${to.title}, position ${toIndex + 1}`)
    },
    [columns],
  )

  const measure = React.useCallback((skip: string) => {
    const cols = columns.map((column) => ({
      id: column.id,
      rect: columnEls.current.get(column.id)!.getBoundingClientRect(),
    }))
    const mids: Record<string, number[]> = {}
    for (const column of columns) {
      mids[column.id] = column.cards
        .filter((c) => c.id !== skip)
        .map((c) => {
          const rect = cardEls.current.get(c.id)?.getBoundingClientRect()
          return rect ? rect.top + rect.height / 2 : Number.POSITIVE_INFINITY
        })
    }
    snapshot.current = { columns: cols, mids }
  }, [columns])

  const locate = (x: number, y: number) => {
    const shot = snapshot.current
    if (!shot) return null
    const hit =
      shot.columns.find((c) => x >= c.rect.left && x <= c.rect.right) ??
      // Past the ends of the board, fall to the nearest column rather than nothing.
      (x < shot.columns[0]!.rect.left ? shot.columns[0] : shot.columns[shot.columns.length - 1])
    if (!hit) return null
    const mids = shot.mids[hit.id] ?? []
    let index = mids.length
    for (let i = 0; i < mids.length; i += 1) {
      if (y < mids[i]!) {
        index = i
        break
      }
    }
    return { col: hit.id, index }
  }

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>, cardId: string, from: string) => {
    if (event.button !== 0) return
    // Capture straight away so every later move and the release are delivered
    // to this card. Without it the handler fires on whatever card the pointer
    // happens to be over, and the board picks up the wrong one.
    event.currentTarget.setPointerCapture(event.pointerId)
    press.current = { cardId, from, x: event.clientX, y: event.clientY, live: true }
  }

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const held = press.current
    if (!held.live) return
    const travelled = Math.hypot(event.clientX - held.x, event.clientY - held.y)

    if (!dragRef.current) {
      if (travelled < SLOP) return
      measure(held.cardId)
      dragRef.current = { cardId: held.cardId, from: held.from }
      setDrag(dragRef.current)
    }

    const node = cardEls.current.get(held.cardId)
    if (node) node.style.transform = `translate(${event.clientX - held.x}px, ${event.clientY - held.y}px)`

    const next = locate(event.clientX, event.clientY)
    dropRef.current = next
    setDrop((prev) => (prev?.col === next?.col && prev?.index === next?.index ? prev : next))
  }

  const onPointerUp = () => {
    const held = press.current
    held.live = false
    const node = cardEls.current.get(held.cardId)
    if (node) node.style.transform = ""
    // Read the refs, not state: press, move and release can all land inside a
    // single task, and the handler's closure would still be a render behind.
    if (dragRef.current && dropRef.current) {
      move(dragRef.current.cardId, dropRef.current.col, dropRef.current.index)
    }
    dragRef.current = null
    dropRef.current = null
    setDrag(null)
    setDrop(null)
    snapshot.current = null
  }

  const onKeyDown = (event: React.KeyboardEvent, cardId: string, colId: string, index: number) => {
    const at = columns.findIndex((c) => c.id === colId)
    const sideways = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0
    const vertical = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0
    if (!sideways && !vertical) return

    event.preventDefault()
    refocus.current = cardId

    if (sideways) {
      const target = columns[at + sideways]
      if (!target) return
      move(cardId, target.id, Math.min(index, target.cards.length))
      return
    }

    const column = columns[at]!
    const to = index + vertical
    if (to < 0 || to >= column.cards.length) return
    // Aiming at a slot below means aiming past the gap this card leaves behind.
    move(cardId, colId, vertical > 0 ? to + 1 : to)
  }

  return (
    <div className={cn("w-full bg-background p-6 text-foreground", className)}>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <section
            key={column.id}
            ref={(node) => {
              if (node) columnEls.current.set(column.id, node)
              else columnEls.current.delete(column.id)
            }}
            aria-label={column.title}
            className={cn(
              "flex min-w-0 flex-col rounded-xl border border-border bg-card/40 p-2.5 transition-colors",
              drop?.col === column.id && "border-primary/50 bg-card/70",
            )}
          >
            <header className="flex items-center justify-between px-1.5 pb-2.5">
              <h3 className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {column.title}
              </h3>
              <span className="rounded-full bg-border px-1.5 text-[0.65rem] tabular-nums text-muted-foreground">
                {column.cards.length}
              </span>
            </header>

            <ul className="flex min-h-[4.5rem] flex-col gap-2">
              {column.cards.map((card, index) => (
                <li key={card.id} className="relative">
                  {drop?.col === column.id && drop.index === index ? <Slot /> : null}
                  <button
                    type="button"
                    ref={(node) => {
                      if (node) cardEls.current.set(card.id, node)
                      else cardEls.current.delete(card.id)
                    }}
                    onPointerDown={(event) => onPointerDown(event, card.id, column.id)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onKeyDown={(event) => onKeyDown(event, card.id, column.id, index)}
                    className={cn(
                      "w-full touch-none rounded-lg border border-border bg-card p-2.5 text-left",
                      "transition-[box-shadow,border-color,opacity] hover:border-foreground/20",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      drag?.cardId === card.id
                        ? "relative z-20 cursor-grabbing opacity-90 shadow-[0_16px_36px_rgb(0_0_0/0.45)]"
                        : "cursor-grab",
                    )}
                  >
                    <span className="flex items-start gap-1.5">
                      {card.flagged ? (
                        <span aria-label="Flagged" className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                      ) : null}
                      <span className="text-[0.8rem] leading-snug">{card.title}</span>
                    </span>
                    {card.meta ? (
                      <span className="mt-1.5 block text-[0.65rem] text-muted-foreground">{card.meta}</span>
                    ) : null}
                  </button>
                </li>
              ))}

              {drop?.col === column.id && drop.index >= column.cards.length ? (
                <li className="relative">
                  <Slot />
                </li>
              ) : null}
            </ul>
          </section>
        ))}
      </div>

      <p className="mx-auto mt-4 max-w-5xl text-[0.7rem] text-muted-foreground">
        Drag a card, or focus one and use the arrow keys.
      </p>
      <p aria-live="polite" className="sr-only">
        {note}
      </p>
    </div>
  )
}

function Slot() {
  return (
    <span
      aria-hidden
      className="absolute -top-1 left-0 right-0 z-10 block h-0.5 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]"
    />
  )
}
