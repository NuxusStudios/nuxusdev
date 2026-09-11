import { MiniCalendar } from "@/registry/components/mini-calendar"

export default function DemoMiniCalendar() {
  return (
    <div className="flex min-h-[380px] items-center justify-center gap-6 p-8">
      <MiniCalendar />
      <MiniCalendar range className="hidden sm:block" />
    </div>
  )
}
