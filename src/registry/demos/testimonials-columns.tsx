import { TestimonialsColumn, type Testimonial } from "@/registry/components/testimonials-columns"

const testimonials: Testimonial[] = [
  { text: "Shipped a full marketing page in an afternoon. The prompts just work.", name: "Dana Whitfield", role: "Founder, Trailhead" },
  { text: "Our design system finally has a distribution channel the whole team uses.", name: "Marc Lévy", role: "Design Lead, Northwind" },
  { text: "I paste the prompt into Claude Code and the component lands in my repo.", name: "Priya Nair", role: "Engineer, Cadence" },
  { text: "The live previews sold it for me. No more guessing from a screenshot.", name: "Tomás Ruiz", role: "Indie maker" },
]

export default function DemoTestimonialsColumns() {
  return (
    <div className="relative flex h-[420px] justify-center gap-6 overflow-hidden px-6 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
      <TestimonialsColumn testimonials={testimonials} duration={15} />
      <TestimonialsColumn testimonials={[...testimonials].reverse()} duration={19} className="hidden md:block" />
      <TestimonialsColumn testimonials={testimonials} duration={17} className="hidden lg:block" />
    </div>
  )
}
