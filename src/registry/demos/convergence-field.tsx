import { ConvergenceField } from "@/registry/components/convergence-field"

export default function DemoConvergenceField() {
  return (
    <div className="relative min-h-[520px] w-full overflow-hidden bg-background">
      <ConvergenceField className="absolute inset-0" />
      <div className="pointer-events-none relative z-10 flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
        <h2 className="text-3xl font-light uppercase tracking-tight text-foreground md:text-4xl">
          Convergence Field
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Every path runs to the same point. Click anywhere to send a wave through them.
        </p>
      </div>
    </div>
  )
}
