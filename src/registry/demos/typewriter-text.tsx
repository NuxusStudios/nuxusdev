import { TypewriterText } from "@/registry/components/typewriter-text"

export default function DemoTypewriterText() {
  return (
    <div className="flex min-h-[240px] items-center justify-center px-6">
      <p className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
        Build{" "}
        <TypewriterText
          words={["heroes", "dashboards", "pricing pages", "anything"]}
          className="text-sky-400"
        />
      </p>
    </div>
  )
}
