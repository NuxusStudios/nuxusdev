import { ScrollRevealText } from "@/registry/components/scroll-reveal-text"

export default function DemoScrollRevealText() {
  return (
    <div className="mx-auto max-w-3xl px-8 py-24">
      <ScrollRevealText>
        Every component here has an author, a live preview, and source you can read before you
        commit to it. Scroll, and the sentence lights up word by word.
      </ScrollRevealText>
    </div>
  )
}
