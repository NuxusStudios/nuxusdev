import { AuroraBackground } from "@/registry/components/aurora-background"

export default function DemoAuroraBackground() {
  return (
    <AuroraBackground>
      <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
        Background lights are cool.
      </h1>
      <p className="text-base text-white/60 md:text-xl">
        And this one is built with pure CSS.
      </p>
      <button className="mt-2 rounded-full bg-white px-6 py-2 text-sm font-medium text-black">
        Debug now
      </button>
    </AuroraBackground>
  )
}
