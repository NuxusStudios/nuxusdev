import { AiChatInput } from "@/registry/components/ai-chat-input"

export default function DemoAiChatInput() {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-6">
      <AiChatInput placeholder="Build me a pricing section with three tiers…" />
    </div>
  )
}
