"use client"

import * as React from "react"
import { ArrowUp, Globe, Paperclip, Sparkles, Square } from "lucide-react"
import { cn } from "@/lib/utils"

export function AiChatInput({
  placeholder = "Ask anything…",
  onSend,
}: {
  placeholder?: string
  onSend?: (value: string) => void
}) {
  const [value, setValue] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const ref = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = Math.min(el.scrollHeight, 180) + "px"
  }, [value])

  function send() {
    if (!value.trim()) return
    onSend?.(value)
    setValue("")
    setBusy(true)
    setTimeout(() => setBusy(false), 1600)
  }

  return (
    <div className="w-full max-w-2xl">
      <div
        className={cn(
          "rounded-2xl border border-white/12 bg-white/[0.04] p-2 backdrop-blur-xl",
          "shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_20px_60px_-25px_rgba(0,0,0,0.9)]",
          "transition-colors focus-within:border-white/25"
        )}
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder={placeholder}
          className="max-h-44 w-full resize-none bg-transparent px-3 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30"
        />

        <div className="flex items-center justify-between gap-2 px-1 pb-0.5 pt-1">
          <div className="flex items-center gap-1">
            <IconButton label="Attach"><Paperclip className="size-4" /></IconButton>
            <IconButton label="Search the web"><Globe className="size-4" /></IconButton>
            <button className="ml-1 inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 text-xs text-white/70 transition hover:bg-white/10">
              <Sparkles className="size-3.5" /> Auto
            </button>
          </div>

          <button
            onClick={send}
            disabled={!value.trim() && !busy}
            className={cn(
              "inline-flex size-8 items-center justify-center rounded-full transition",
              busy
                ? "bg-white text-black"
                : value.trim()
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 text-white/30"
            )}
          >
            {busy ? <Square className="size-3 fill-current" /> : <ArrowUp className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function IconButton({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <button
      aria-label={label}
      className="inline-flex size-7 items-center justify-center rounded-full text-white/45 transition hover:bg-white/10 hover:text-white"
    >
      {children}
    </button>
  )
}
