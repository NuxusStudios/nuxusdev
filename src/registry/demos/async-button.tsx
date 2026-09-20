"use client"

import { AsyncButton } from "@/registry/components/async-button"

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function DemoAsyncButton() {
  return (
    <div className="flex min-h-[260px] w-full flex-col items-center justify-center gap-6 bg-background p-8">
      <AsyncButton action={() => wait(1400)} />

      <AsyncButton
        action={async () => {
          await wait(1200)
          throw new Error("nope")
        }}
        label="Deploy to production"
        pendingLabel="Deploying"
        errorLabel="Deploy failed"
      />

      <p className="max-w-xs text-center text-[0.72rem] text-muted-foreground">
        The second one always fails, so you can see the error path. Both keep the
        same width through every state.
      </p>
    </div>
  )
}
