"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

/**
 * Searching 37,000 items happens on the server, so the query lives in the URL
 * rather than shipping the index to the browser.
 */
export function EcosystemSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [value, setValue] = React.useState(initialQuery)

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const query = value.trim()
        router.push(query ? `/community/registries?q=${encodeURIComponent(query)}` : "/community/registries")
      }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search every registry — kanban, otp input, file tree…"
          className="pl-9"
          autoComplete="off"
          aria-label="Search every shadcn registry"
        />
      </div>
    </form>
  )
}
