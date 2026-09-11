import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "border-border bg-secondary/70 text-muted-foreground",
        outline: "border-border text-muted-foreground",
        brand: "border-brand/30 bg-brand/12 text-brand",
        new: "border-emerald-500/30 bg-emerald-500/12 text-emerald-400",
        solid: "border-transparent bg-foreground text-background",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
