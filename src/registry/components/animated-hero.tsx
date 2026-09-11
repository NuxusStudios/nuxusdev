"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "motion/react"
import { MoveRight, PhoneCall } from "lucide-react"

export function AnimatedHero({
  titles = ["amazing", "new", "wonderful", "beautiful", "smart"],
  heading = "This is something",
  description = "Managing a small business today is already tough. Avoid further complications by ditching outdated, tedious trade methods.",
}: {
  titles?: string[]
  heading?: string
  description?: string
}) {
  const [index, setIndex] = useState(0)
  const words = useMemo(() => titles, [titles])

  useEffect(() => {
    const id = setTimeout(() => setIndex((i) => (i + 1) % words.length), 2000)
    return () => clearTimeout(id)
  }, [index, words])

  return (
    <div className="w-full">
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-32">
          <button className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-1.5 text-sm text-foreground/70 transition hover:bg-foreground/10">
            Read our launch article <MoveRight className="size-4" />
          </button>

          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-center text-5xl font-semibold tracking-tighter text-foreground md:text-7xl">
              <span className="text-foreground/90">{heading}</span>
              <span className="relative flex w-full justify-center overflow-hidden pt-1 text-center md:pb-4 md:pt-1">
                &nbsp;
                {words.map((title, i) => (
                  <motion.span
                    key={title}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      index === i
                        ? { y: 0, opacity: 1 }
                        : { y: index > i ? -150 : 150, opacity: 0 }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed tracking-tight text-foreground/50 md:text-xl">
              {description}
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <button className="inline-flex h-11 items-center gap-2 rounded-lg border border-foreground/15 px-5 text-sm font-medium text-foreground transition hover:bg-foreground/5">
              Jump on a call <PhoneCall className="size-4" />
            </button>
            <button className="inline-flex h-11 items-center gap-2 rounded-lg bg-foreground px-5 text-sm font-medium text-background transition hover:bg-foreground/90">
              Sign up here <MoveRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
