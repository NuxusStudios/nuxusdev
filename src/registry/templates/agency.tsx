import { AuroraBackground } from "@/registry/components/aurora-background"
import { TestimonialsColumn, type Testimonial } from "@/registry/components/testimonials-columns"
import { StatsSection } from "@/registry/components/stats-section"
import { FaqAccordion } from "@/registry/components/faq-accordion"
import { FooterSection } from "@/registry/components/footer-section"

const testimonials: Testimonial[] = [
  { text: "They rebuilt our marketing site in three weeks and conversion went up 28%.", name: "Dana Whitfield", role: "Founder, Trailhead" },
  { text: "The handoff was the cleanest we've had. Real components, not screenshots.", name: "Marc Lévy", role: "Design Lead, Northwind" },
  { text: "Every page they touched got faster and easier to edit.", name: "Priya Nair", role: "Engineer, Cadence" },
]

const stats = [
  { value: 148, suffix: "+", label: "Projects shipped" },
  { value: 32, label: "Design engineers" },
  { value: 4.9, decimals: 1, label: "Average rating" },
  { value: 21, suffix: " days", label: "Median delivery" },
]

const faqs = [
  { question: "How do engagements work?", answer: "Fixed-scope sprints of two to four weeks, with a working build at the end of each." },
  { question: "Do you work with our design system?", answer: "Yes — we extend what you have rather than replacing it." },
  { question: "Who owns the code?", answer: "You do, from day one. Everything lands in your repository." },
]

const columns = [
  { title: "Studio", links: [{ label: "Work", href: "#" }, { label: "Process", href: "#" }, { label: "Team", href: "#" }] },
  { title: "Services", links: [{ label: "Design systems", href: "#" }, { label: "Marketing sites", href: "#" }, { label: "Product UI", href: "#" }] },
  { title: "Contact", links: [{ label: "hello@studio.com", href: "#" }, { label: "Book a call", href: "#" }] },
]

export default function AgencyTemplate() {
  return (
    <div className="bg-zinc-950">
      <AuroraBackground className="min-h-[520px]">
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
          Design engineering studio
        </span>
        <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Interfaces that feel inevitable
        </h1>
        <p className="mt-5 max-w-lg text-white/60">
          We design and build product surfaces for teams who care about the last five percent.
        </p>
        <div className="mt-8 flex gap-3">
          <button className="h-11 rounded-xl bg-white px-6 text-sm font-medium text-black">Start a project</button>
          <button className="h-11 rounded-xl border border-white/20 px-6 text-sm font-medium text-white">See our work</button>
        </div>
      </AuroraBackground>

      <StatsSection stats={stats} title="A decade of shipped work" />

      <section className="relative flex h-[440px] justify-center gap-6 overflow-hidden px-6 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
        <TestimonialsColumn testimonials={testimonials} duration={15} />
        <TestimonialsColumn testimonials={[...testimonials].reverse()} duration={19} className="hidden md:block" />
        <TestimonialsColumn testimonials={testimonials} duration={17} className="hidden lg:block" />
      </section>

      <FaqAccordion items={faqs} title="How we work" />
      <FooterSection columns={columns} brand="Studio" tagline="Design engineering, end to end." />
    </div>
  )
}
