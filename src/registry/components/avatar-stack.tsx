"use client"

import { cn } from "@/lib/utils"

export interface StackedUser {
  name: string
  image?: string
  color?: string
}

export function AvatarStack({
  users,
  max = 5,
  size = 34,
  className,
}: {
  users: StackedUser[]
  max?: number
  size?: number
  className?: string
}) {
  const shown = users.slice(0, max)
  const extra = users.length - shown.length

  return (
    <div className={cn("flex items-center", className)}>
      {shown.map((u, i) => (
        <div
          key={u.name}
          title={u.name}
          style={{
            width: size,
            height: size,
            marginLeft: i === 0 ? 0 : -size / 3,
            zIndex: shown.length - i,
            background: u.color ?? "rgba(255,255,255,0.12)",
          }}
          className="relative flex items-center justify-center rounded-full border-2 border-zinc-950 text-[11px] font-semibold text-white transition-transform hover:z-20 hover:-translate-y-1"
        >
          {u.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={u.image} alt={u.name} className="size-full rounded-full object-cover" />
          ) : (
            u.name.slice(0, 2).toUpperCase()
          )}
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{ width: size, height: size, marginLeft: -size / 3 }}
          className="flex items-center justify-center rounded-full border-2 border-zinc-950 bg-white/10 text-[11px] font-semibold text-white/70"
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
