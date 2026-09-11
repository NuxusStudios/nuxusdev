import { DotPattern } from "@/registry/components/dot-pattern"

export default function DemoDotPattern() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <DotPattern className="[mask-image:radial-gradient(320px_circle_at_center,white,transparent)]" />
      <p className="z-10 whitespace-pre-wrap text-center text-5xl font-semibold tracking-tighter text-foreground">
        Dot Pattern
      </p>
    </div>
  )
}
