import { FaqAccordion } from "@/registry/components/faq-accordion"

const items = [
  { question: "What is this registry?", answer: "A community catalogue of React components you copy as code or as a prompt." },
  { question: "Is it free?", answer: "Browsing is free. A paid plan unlocks unlimited copies, MCP access and AI credits." },
  { question: "Does it work with shadcn/ui?", answer: "Yes — components follow shadcn conventions and drop into components/ui." },
  { question: "Can I publish my own?", answer: "Yes. Publish a component with a demo and it appears under your handle." },
]

export default function DemoFaqAccordion() {
  return <FaqAccordion items={items} description="Everything you need to know about the registry." />
}
