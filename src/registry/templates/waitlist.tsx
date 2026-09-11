"use client"

import { MeshGradient } from "@/registry/components/mesh-gradient"
import { TypewriterText } from "@/registry/components/typewriter-text"
import { AvatarStack } from "@/registry/components/avatar-stack"

export default function WaitlistTemplate() {
  return (
    <div className="relative flex min-h-[700px] flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
      <div className="absolute inset-0 opacity-60">
        <MeshGradient colors={["#1d4ed8", "#0891b2", "#7c3aed", "#0f172a"]} speed={0.25} />
      </div>

      <div className="relative z-10 flex max-w-xl flex-col items-center">
        <span className="mb-6 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
          Launching this spring
        </span>

        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl">
          The fastest way to{" "}
          <TypewriterText words={["ship UI", "prototype", "iterate"]} className="text-sky-300" />
        </h1>

        <p className="mt-5 max-w-md text-white/60">
          Join the waitlist and get early access, plus a founding-member price when we open up.
        </p>

        <form className="mt-8 flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="you@company.com"
            className="h-11 flex-1 rounded-xl border border-white/15 bg-black/40 px-4 text-sm text-white outline-none backdrop-blur placeholder:text-white/30 focus:border-white/35"
          />
          <button className="h-11 shrink-0 rounded-xl bg-white px-5 text-sm font-medium text-black transition hover:bg-white/90">
            Join waitlist
          </button>
        </form>

        <div className="mt-7 flex items-center gap-3">
          <AvatarStack
            size={28}
            users={[
              { name: "Nova Reyes", color: "#7c5cff" },
              { name: "Kaito Mori", color: "#00c2a8" },
              { name: "Amara Osei", color: "#f59e0b" },
              { name: "Juno Park", color: "#3b82f6" },
            ]}
          />
          <span className="text-sm text-white/50">2,481 builders already joined</span>
        </div>
      </div>
    </div>
  )
}
