import { Inbox } from "lucide-react"
import { EmptyState } from "@/registry/components/empty-state"

export default function DemoEmptyState() {
  return (
    <div className="flex min-h-[340px] items-center justify-center p-8">
      <EmptyState
        icon={<Inbox className="size-5" />}
        title="No components yet"
        description="Publish your first component and it will show up here with a live preview and a copyable prompt."
        action={
          <button className="h-9 rounded-lg bg-white px-4 text-sm font-medium text-black transition hover:bg-white/90">
            Publish component
          </button>
        }
        secondaryAction={
          <button className="h-9 rounded-lg border border-white/15 px-4 text-sm font-medium text-white transition hover:bg-white/5">
            Read the guide
          </button>
        }
      />
    </div>
  )
}
