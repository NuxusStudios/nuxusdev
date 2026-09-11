import { Marquee } from "@/registry/components/marquee"

const logos = ["Vercel", "Linear", "Stripe", "Supabase", "Raycast", "Framer", "Resend", "Clerk"]

export default function DemoMarquee() {
  return (
    <div className="relative flex min-h-[220px] w-full flex-col items-center justify-center overflow-hidden">
      <p className="mb-6 text-xs uppercase tracking-[0.2em] text-white/30">Trusted by teams at</p>
      <Marquee pauseOnHover className="[--duration:24s]">
        {logos.map((name) => (
          <span key={name} className="px-6 text-2xl font-semibold tracking-tight text-white/35 transition hover:text-white">
            {name}
          </span>
        ))}
      </Marquee>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-zinc-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-zinc-950" />
    </div>
  )
}
