import { AnimatedTabs } from "@/registry/components/animated-tabs"

export default function DemoAnimatedTabs() {
  return (
    <div className="flex min-h-[220px] items-center justify-center">
      <AnimatedTabs
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "code", label: "Code" },
          { value: "preview", label: "Preview" },
          { value: "settings", label: "Settings" },
        ]}
      />
    </div>
  )
}
