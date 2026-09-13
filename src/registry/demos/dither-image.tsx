import { DitherImage } from "@/registry/components/dither-image"

export default function DemoDitherImage() {
  return (
    <div className="flex w-full justify-center bg-background p-6">
      <DitherImage
        className="aspect-[3/2] w-full max-w-2xl"
        alt="Still water beneath a ridgeline"
      />
    </div>
  )
}
