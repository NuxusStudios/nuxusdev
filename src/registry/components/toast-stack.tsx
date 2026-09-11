"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Tone = "success" | "error" | "warning" | "info"

export interface Toast {
  id: number
  tone: Tone
  title: string
  description?: string
}

const ICONS: Record<Tone, React.ReactNode> = {
  success: <CheckCircle2 className="size-4 text-emerald-400" />,
  error: <XCircle className="size-4 text-rose-400" />,
  warning: <AlertTriangle className="size-4 text-amber-400" />,
  info: <Info className="size-4 text-sky-400" />,
}

export function useToastStack(max = 3) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const next = React.useRef(0)

  const push = React.useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = next.current++
      setToasts((cur) => [{ ...toast, id }, ...cur].slice(0, max))
      setTimeout(() => setToasts((cur) => cur.filter((t) => t.id !== id)), 4000)
    },
    [max]
  )

  const dismiss = React.useCallback(
    (id: number) => setToasts((cur) => cur.filter((t) => t.id !== id)),
    []
  )

  return { toasts, push, dismiss }
}

export function ToastStack({
  toasts,
  onDismiss,
  className,
}: {
  toasts: Toast[]
  onDismiss: (id: number) => void
  className?: string
}) {
  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-2", className)}>
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="flex items-start gap-3 rounded-xl border border-white/12 bg-[#101014]/95 p-3.5 shadow-2xl shadow-black/50 backdrop-blur"
          >
            <span className="mt-0.5 shrink-0">{ICONS[toast.tone]}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-white">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-[12.5px] leading-relaxed text-white/45">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 rounded p-0.5 text-white/30 transition hover:text-white"
              aria-label="Dismiss"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
