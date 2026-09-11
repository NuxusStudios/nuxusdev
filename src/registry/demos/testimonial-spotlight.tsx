import { TestimonialSpotlight } from "@/registry/components/testimonial-spotlight"

const testimonials = [
  { quote: "We replaced three weeks of design work with an afternoon. The prompts land in Claude Code and just work.", name: "Dana Whitfield", role: "Founder, Trailhead", color: "#7c5cff" },
  { quote: "The live previews are the whole thing. I stopped guessing what a component does from a screenshot.", name: "Marc Lévy", role: "Design Lead, Northwind", color: "#00c2a8" },
  { quote: "Our design system finally has a distribution channel the whole team actually uses.", name: "Priya Nair", role: "Engineer, Cadence", color: "#f59e0b" },
]

export default function DemoTestimonialSpotlight() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <TestimonialSpotlight testimonials={testimonials} />
    </div>
  )
}
