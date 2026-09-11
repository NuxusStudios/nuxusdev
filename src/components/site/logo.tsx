import Link from "next/link"
import { BRAND } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  wordmark = true,
}: {
  className?: string
  wordmark?: boolean
}) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2.5", className)}
      aria-label={`${BRAND.name} home`}
    >
      <LogoMark className="size-6 text-foreground transition-transform duration-300 group-hover:rotate-90" />
      {wordmark && (
        <span className="text-[17px] font-semibold leading-none tracking-[-0.02em]">
          {BRAND.wordmark}
        </span>
      )}
    </Link>
  )
}

/**
 * The crossing-X motif from the Nuxus wordmark: two diagonals meeting, the
 * trailing one hooking over like the swash in the original lettering.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4.2 3.6 L19.8 20.4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
      <path
        d="M19.8 8.6 V6.4 A3.1 3.1 0 0 0 14.6 4.2 L4.2 20.4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  )
}
