import { DiagonalStripes } from "@/registry/components/diagonal-stripes"

export default function DemoDiagonalStripes() {
  return (
    <div className="relative flex min-h-[320px] w-full items-center justify-center overflow-hidden bg-background">
      <DiagonalStripes />
      <div className="relative z-10 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground">Diagonal Stripes</h3>
        <p className="mt-2 text-sm text-muted-foreground">Repeating stripes on a slow travel</p>
      </div>
    </div>
  )
}
