"use client"

import { AiChatInput } from "@/registry/components/ai-chat-input"
import { MeshGradient } from "@/registry/components/mesh-gradient"
import { BentoCard, BentoGrid } from "@/registry/components/bento-grid"
import { FaqAccordion } from "@/registry/components/faq-accordion"
import { Brain, Gauge, Lock, Plug, Sparkles, Workflow } from "lucide-react"

const features = [
  { name: "Any model", description: "Swap providers without touching your code.", icon: <Brain className="size-4" />, className: "col-span-3 lg:col-span-2" },
  { name: "Streaming", description: "First token in under 200ms.", icon: <Gauge className="size-4" />, className: "col-span-3 lg:col-span-1" },
  { name: "Your data stays yours", description: "Nothing is retained or trained on.", icon: <Lock className="size-4" />, className: "col-span-3 lg:col-span-1" },
  { name: "200+ integrations", description: "Connect the tools you already run.", icon: <Plug className="size-4" />, className: "col-span-3 lg:col-span-1" },
  { name: "Workflows", description: "Chain steps and branch on output.", icon: <Workflow className="size-4" />, className: "col-span-3 lg:col-span-1" },
]

const faqs = [
  { question: "Which models can I use?", answer: "Every major provider, plus anything you host yourself behind an OpenAI-compatible endpoint." },
  { question: "Do you train on my data?", answer: "No. Prompts and completions are never retained beyond the request unless you turn on logging." },
  { question: "How is it priced?", answer: "Per million tokens, at cost plus a flat platform fee. No seat minimums." },
]

export default function AiProductTemplate() {
  return (
    <div className="bg-black">
      <section className="relative flex min-h-[560px] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 opacity-50">
          <MeshGradient colors={["#4c1d95", "#1e3a8a", "#0f766e", "#000000"]} speed={0.22} />
        </div>

        <div className="relative z-10 flex w-full max-w-2xl flex-col items-center">
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur">
            <Sparkles className="size-3" /> Now with tool calling
          </span>
          <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-white md:text-6xl">
            One API for
            <br />
            every model
          </h1>
          <p className="mt-5 max-w-md text-white/55">
            Route between providers, stream to the browser, and never rewrite your integration
            again.
          </p>
          <div className="mt-9 w-full">
            <AiChatInput placeholder="Summarise this quarter's support tickets…" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <BentoGrid>
          {features.map((f) => (
            <BentoCard key={f.name} {...f} />
          ))}
        </BentoGrid>
      </section>

      <FaqAccordion items={faqs} title="Questions" description="The ones we get asked most." />
    </div>
  )
}
