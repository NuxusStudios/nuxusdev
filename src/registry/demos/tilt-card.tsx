import { TiltCard } from "@/registry/components/tilt-card"

export default function DemoTiltCard() {
  return (
    <div className="flex min-h-[340px] items-center justify-center bg-[radial-gradient(120%_120%_at_50%_0%,#111827,#020617)] p-10">
      <TiltCard className="w-72">
        <span className="text-xs uppercase tracking-[0.18em] text-white/35">Membership</span>
        <h3 className="mt-6 text-2xl font-semibold text-white">Builder</h3>
        <p className="mt-1 text-sm text-white/45">Unlimited copies, MCP access.</p>
        <div className="mt-10 flex items-end justify-between">
          <span className="font-mono text-sm text-white/50">•••• 4021</span>
          <span className="text-lg font-semibold text-white">$6/mo</span>
        </div>
      </TiltCard>
    </div>
  )
}
