import { CalendarDays, MapPin, Ticket } from "lucide-react"
import { Timeline } from "@/registry/components/timeline"
import { TeamGrid } from "@/registry/components/team-grid"
import { PricingSection } from "@/registry/components/pricing-section"
import { MegaFooter } from "@/registry/components/mega-footer"
import { AuroraBackground } from "@/registry/components/aurora-background"

/** A single-track conference site: date, speakers, schedule and tickets. */

const speakers = [
  { name: "Ada Ferrow", role: "Principal engineer, Northwind", image: img("1494790108377-be9c29b29330") },
  { name: "Kell Mora", role: "Design systems lead, Arc", image: img("1500648767791-00dcc994a43e") },
  { name: "Juno Vale", role: "Creator, Flux Motion", image: img("1534528741775-53994a69daeb") },
  { name: "Rue Alcott", role: "Staff designer, Meridian", image: img("1517841905240-472988babdf9") },
  { name: "Sim Oyo", role: "Head of platform, Orbit", image: img("1506794778202-cad84cf45f1d") },
  { name: "Noor Halim", role: "Accessibility lead, Sable", image: img("1544005313-94ddf0286df2") },
]

function img(id: string) {
  return `https://images.unsplash.com/photo-${id}?w=320&h=320&fit=crop&q=70&auto=format`
}

const schedule = [
  { title: "Doors and coffee", date: "09:00", description: "Badge pickup in the foyer.", status: "done" as const },
  { title: "Opening — what we broke this year", date: "09:45", description: "Ada Ferrow on shipping a rewrite nobody asked for.", status: "current" as const },
  { title: "Design systems that survive contact", date: "10:40", description: "Kell Mora on tokens, and when to abandon them.", status: "upcoming" as const },
  { title: "Lunch", date: "12:15", description: "Catered, with a quiet room upstairs.", status: "upcoming" as const },
  { title: "Motion without the migraine", date: "13:30", description: "Juno Vale on reduced-motion as a design constraint.", status: "upcoming" as const },
  { title: "Closing panel", date: "16:00", description: "Everyone, plus questions from the floor.", status: "upcoming" as const },
]

const tiers = [
  { name: "Community", price: { monthly: 0, yearly: 0 }, description: "Livestream and recordings.", cta: "Register free", features: ["Live stream", "Recordings after the event"] },
  { name: "In person", price: { monthly: 180, yearly: 150 }, description: "The room, the hallway track, lunch.", cta: "Buy a ticket", popular: true, features: ["Full day access", "Lunch and coffee", "Recordings", "Hallway track"] },
  { name: "Workshop", price: { monthly: 420, yearly: 360 }, description: "The day before, hands on.", cta: "Buy workshop", features: ["Everything in person", "Full-day workshop", "Capped at 24 people"] },
]

const footer = [
  { title: "Event", links: [{ label: "Schedule", href: "#" }, { label: "Speakers", href: "#" }, { label: "Venue", href: "#" }] },
  { title: "Attend", links: [{ label: "Tickets", href: "#" }, { label: "Code of conduct", href: "#" }, { label: "Accessibility", href: "#" }] },
  { title: "Past years", links: [{ label: "2025 talks", href: "#" }, { label: "2024 talks", href: "#" }] },
]

export default function ConferenceTemplate() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative">
        <AuroraBackground className="absolute inset-0" />
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
          <p className="text-[13px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Third edition
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
            Interfaces that hold up
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            One day, one track, no product pitches. For the people who maintain the thing after
            launch week.
          </p>

          <dl className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4" />
              <dt className="sr-only">Date</dt>
              <dd>14 November 2026</dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4" />
              <dt className="sr-only">Venue</dt>
              <dd>Lisbon, and streamed</dd>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="size-4" />
              <dt className="sr-only">Availability</dt>
              <dd>180 seats</dd>
            </div>
          </dl>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* TeamGrid prints its own heading — passing the title avoids the
            section carrying two of them */}
        <TeamGrid
          title="Speaking"
          description="Six talks, no product pitches, and time between them to actually talk."
          members={speakers}
          className="px-0"
        />

        <section className="mt-20">
          <h2 className="text-xl font-semibold tracking-tight">The day</h2>
          <div className="mt-6 max-w-2xl">
            <Timeline entries={schedule} />
          </div>
        </section>
      </main>

      <PricingSection tiers={tiers} />

      <MegaFooter brand="Interfaces" tagline="A one-day conference in Lisbon." columns={footer} />
    </div>
  )
}
