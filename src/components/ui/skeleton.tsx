import { cn } from "@/lib/utils"
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("animate-pulse rounded-lg bg-secondary/70", className)} {...props} />
}
