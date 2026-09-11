"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

export function MiniCalendar({
  value,
  onChange,
  className,
  range = false,
}: {
  value?: Date
  onChange?: (date: Date) => void
  className?: string
  range?: boolean
}) {
  const [cursor, setCursor] = React.useState(() => value ?? new Date())
  const [selected, setSelected] = React.useState<Date | undefined>(value)
  const [end, setEnd] = React.useState<Date | undefined>()

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const isSame = (a: Date | undefined, day: number) =>
    !!a && a.getFullYear() === year && a.getMonth() === month && a.getDate() === day

  const inRange = (day: number) => {
    if (!range || !selected || !end) return false
    const d = new Date(year, month, day).getTime()
    return d > selected.getTime() && d < end.getTime()
  }

  function pick(day: number) {
    const date = new Date(year, month, day)
    if (range && selected && !end && date > selected) {
      setEnd(date)
      return
    }
    setSelected(date)
    setEnd(undefined)
    onChange?.(date)
  }

  return (
    <div
      className={cn(
        "w-[276px] rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-3.5",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          className="flex size-7 items-center justify-center rounded-lg text-foreground/50 transition hover:bg-foreground/10 hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-[13px] font-medium text-foreground">
          {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
        <button
          onClick={() => setCursor(new Date(year, month + 1, 1))}
          className="flex size-7 items-center justify-center rounded-lg text-foreground/50 transition hover:bg-foreground/10 hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {DAYS.map((d) => (
          <span key={d} className="pb-1 text-center text-[11px] text-foreground/30">
            {d}
          </span>
        ))}
        {cells.map((day, i) =>
          day === null ? (
            <span key={`e-${i}`} />
          ) : (
            <button
              key={day}
              onClick={() => pick(day)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg text-[13px] tabular-nums transition",
                isSame(selected, day) || isSame(end, day)
                  ? "bg-foreground font-medium text-background"
                  : inRange(day)
                    ? "bg-foreground/10 text-foreground"
                    : "text-foreground/70 hover:bg-foreground/10 hover:text-foreground",
                isSame(today, day) && !isSame(selected, day) && "ring-1 ring-inset ring-foreground/25"
              )}
            >
              {day}
            </button>
          )
        )}
      </div>
    </div>
  )
}
