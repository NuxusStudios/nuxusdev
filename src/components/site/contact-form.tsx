"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"

export function ContactForm() {
  const [sending, setSending] = React.useState(false)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setSending(true)
        setTimeout(() => {
          setSending(false)
          toast.success("Message sent", { description: "We usually reply within a day." })
        }, 1200)
      }}
      className="grid gap-4 rounded-2xl border border-border bg-card p-6"
    >
      <label className="grid gap-1.5">
        <span className="text-[13px] font-medium">Name</span>
        <Input required placeholder="Ada Lovelace" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[13px] font-medium">Email</span>
        <Input required type="email" placeholder="you@company.com" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[13px] font-medium">Message</span>
        <Textarea required className="min-h-[140px]" placeholder="What can we help with?" />
      </label>
      <Button type="submit" disabled={sending} className="gap-2 justify-self-start">
        {sending && <Loader2 className="size-4 animate-spin" />}
        {sending ? "Sending…" : "Send message"}
      </Button>
    </form>
  )
}
