"use client"

import * as React from "react"
import { Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react"
import { Marquee } from "@/registry/components/marquee"
import { AvatarStack } from "@/registry/components/avatar-stack"

const swatches = [
  { name: "Graphite", value: "#2f2f33" },
  { name: "Sand", value: "#d9cbb4" },
  { name: "Moss", value: "#4a5d43" },
  { name: "Ink", value: "#14161a" },
]

export default function EcommerceTemplate() {
  const [colour, setColour] = React.useState(0)
  const [quantity, setQuantity] = React.useState(1)

  return (
    <div className="bg-zinc-950">
      <div className="border-b border-white/10 py-2.5">
        <Marquee className="[--duration:36s]">
          {["Free shipping over $80", "30-day returns", "Carbon-neutral delivery", "Made in Portugal"].map((t) => (
            <span key={t} className="px-8 text-[13px] text-white/40">{t}</span>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto grid max-w-5xl gap-10 px-6 py-14 lg:grid-cols-2">
        <div className="grid gap-3">
          <div
            className="aspect-square rounded-2xl border border-white/10 transition-colors duration-500"
            style={{ background: `radial-gradient(120% 120% at 30% 20%, ${swatches[colour].value}, #0a0a0c)` }}
          />
          <div className="grid grid-cols-4 gap-3">
            {swatches.map((s, i) => (
              <button
                key={s.name}
                onClick={() => setColour(i)}
                className={`aspect-square rounded-xl border transition ${i === colour ? "border-white/60" : "border-white/10 hover:border-white/30"}`}
                style={{ background: s.value }}
                aria-label={s.name}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[13px] uppercase tracking-[0.16em] text-white/35">Everyday carry</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">The Field Bag</h1>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
              ))}
            </span>
            <span className="text-[13px] text-white/45">412 reviews</span>
          </div>

          <p className="mt-5 text-3xl font-semibold text-white">$180</p>
          <p className="mt-4 max-w-md leading-relaxed text-white/55">
            Waxed canvas, full-grain leather base and a laptop sleeve that actually fits a 16&quot;.
            Colour: <span className="text-white">{swatches[colour].name}</span>.
          </p>

          <div className="mt-7 flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-white/12 p-1">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="flex size-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10">
                <Minus className="size-3.5" />
              </button>
              <span className="w-8 text-center text-sm tabular-nums text-white">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(9, q + 1))} className="flex size-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10">
                <Plus className="size-3.5" />
              </button>
            </div>
            <button className="h-11 flex-1 rounded-lg bg-white text-sm font-medium text-black transition hover:bg-white/90">
              Add to bag · ${180 * quantity}
            </button>
          </div>

          <div className="mt-7 grid gap-3 border-t border-white/10 pt-6 text-[13px] text-white/50">
            <p className="flex items-center gap-2"><Truck className="size-4" /> Free delivery, arrives in 2–4 days</p>
            <p className="flex items-center gap-2"><ShieldCheck className="size-4" /> Five-year repair guarantee</p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <AvatarStack
              size={26}
              users={[
                { name: "Ada M", color: "#7c5cff" },
                { name: "Kai T", color: "#00c2a8" },
                { name: "Rin O", color: "#f59e0b" },
              ]}
            />
            <span className="text-[13px] text-white/45">38 people bought this today</span>
          </div>
        </div>
      </div>
    </div>
  )
}
