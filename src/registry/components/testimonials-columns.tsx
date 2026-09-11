"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export interface Testimonial {
  text: string
  image?: string
  name: string
  role: string
}

export function TestimonialsColumn({
  testimonials,
  className,
  duration = 15,
}: {
  testimonials: Testimonial[]
  className?: string
  duration?: number
}) {
  return (
    <div className={className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{ duration, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        className="flex flex-col gap-6 pb-6"
      >
        {[0, 1].map((round) => (
          <div key={round} className="flex flex-col gap-6">
            {testimonials.map(({ text, name, role, image }, i) => (
              <div
                className={cn(
                  "w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.03] p-6",
                  "shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset]"
                )}
                key={`${round}-${i}`}
              >
                <p className="text-sm leading-relaxed text-white/70">{text}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/10 text-xs font-semibold text-white/70">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt={name} className="size-full object-cover" />
                    ) : (
                      name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight text-white">{name}</span>
                    <span className="text-xs leading-tight text-white/40">{role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
