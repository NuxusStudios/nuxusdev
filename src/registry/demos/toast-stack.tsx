"use client"

import { ToastStack, useToastStack } from "@/registry/components/toast-stack"

export default function DemoToastStack() {
  const { toasts, push, dismiss } = useToastStack()

  const samples = [
    { tone: "success" as const, title: "Component published", description: "Shimmer Button is live." },
    { tone: "error" as const, title: "Build failed", description: "Missing dependency: motion." },
    { tone: "warning" as const, title: "Credits running low", description: "84 of 500 remaining." },
    { tone: "info" as const, title: "New follower", description: "@kaito started following you." },
  ]

  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-wrap justify-center gap-2">
        {samples.map((s) => (
          <button
            key={s.tone}
            onClick={() => push(s)}
            className="rounded-lg border border-foreground/12 bg-foreground/[0.04] px-3 py-1.5 text-[13px] capitalize text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground"
          >
            {s.tone}
          </button>
        ))}
      </div>
      <ToastStack toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
