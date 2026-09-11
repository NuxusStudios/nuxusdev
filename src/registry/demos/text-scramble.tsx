"use client"

import * as React from "react"
import { TextScramble } from "@/registry/components/text-scramble"

const PHRASES = ["DECRYPTING", "ACCESS GRANTED", "WELCOME BACK"]

export default function DemoTextScramble() {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % PHRASES.length), 2600)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <TextScramble
        key={index}
        text={PHRASES[index]}
        className="text-3xl font-semibold tracking-tight text-emerald-400 md:text-4xl"
      />
    </div>
  )
}
