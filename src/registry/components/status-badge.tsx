import { cn } from "@/lib/utils"

export type StatusTone = "operational" | "degraded" | "down" | "maintenance" | "beta"

const TONES: Record<StatusTone, { label: string; dot: string; text: string; ring: string }> = {
  operational: { label: "Operational", dot: "bg-emerald-400", text: "text-emerald-300", ring: "ring-emerald-400/20" },
  degraded: { label: "Degraded", dot: "bg-amber-400", text: "text-amber-300", ring: "ring-amber-400/20" },
  down: { label: "Down", dot: "bg-rose-400", text: "text-rose-300", ring: "ring-rose-400/20" },
  maintenance: { label: "Maintenance", dot: "bg-sky-400", text: "text-sky-300", ring: "ring-sky-400/20" },
  beta: { label: "Beta", dot: "bg-violet-400", text: "text-violet-300", ring: "ring-violet-400/20" },
}

export function StatusBadge({
  tone = "operational",
  label,
  pulse = true,
  className,
}: {
  tone?: StatusTone
  label?: string
  pulse?: boolean
  className?: string
}) {
  const t = TONES[tone]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 text-xs font-medium ring-1",
        t.text,
        t.ring,
        className
      )}
    >
      <span className="relative flex size-1.5">
        {pulse && (
          <span className={cn("absolute inline-flex size-full animate-ping rounded-full opacity-75", t.dot)} />
        )}
        <span className={cn("relative inline-flex size-1.5 rounded-full", t.dot)} />
      </span>
      {label ?? t.label}
    </span>
  )
}
