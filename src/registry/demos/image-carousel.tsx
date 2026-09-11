import { ImageCarousel } from "@/registry/components/image-carousel"

const slides = [
  { title: "Aurora", caption: "Layered gradients, pure CSS", background: "radial-gradient(120% 120% at 20% 10%, #3b82f6, #0f172a)" },
  { title: "Ember", caption: "Warm, editorial, unhurried", background: "radial-gradient(120% 120% at 80% 20%, #f97316, #1c1917)" },
  { title: "Moss", caption: "Deep greens, AA contrast", background: "radial-gradient(120% 120% at 50% 90%, #22c55e, #0d1612)" },
  { title: "Violet", caption: "Glow-heavy focus states", background: "radial-gradient(120% 120% at 30% 80%, #a855f7, #12091f)" },
]

export default function DemoImageCarousel() {
  return (
    <div className="p-8">
      <ImageCarousel slides={slides} className="mx-auto max-w-2xl" />
    </div>
  )
}
