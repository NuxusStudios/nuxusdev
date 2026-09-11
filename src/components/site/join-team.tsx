"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { joinTeam } from "@/server/actions/team"

export function JoinTeam({ token }: { token: string }) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  return (
    <Button
      className="w-full gap-2"
      disabled={pending}
      onClick={async () => {
        setPending(true)
        const result = await joinTeam(token)

        if (!result.ok) {
          setPending(false)
          toast.error(result.error)
          return
        }

        toast("You're on the team")
        router.push("/community/components/featured")
        router.refresh()
      }}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      Accept invite
    </Button>
  )
}
