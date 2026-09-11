"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { ComponentPreview } from "@/components/site/component-preview"
import { componentHref } from "@/lib/queries"
import { cn, formatCount } from "@/lib/utils"
import type { ComponentRecord } from "@/lib/types"

const ease = [0.16, 1, 0.3, 1] as const

/**
 * The proof section: a wall of components that are actually running. Cards
 * arrive on scroll with a short stagger so the eye lands on one at a time.
 */
export function ComponentWall({ components }: { components: ComponentRecord[] }) {
  return (
    <section className="relative border-t border-border py-24">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <SectionLabel>Live, not screenshots</SectionLabel>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-[2.75rem] md:leading-[1.05]">
              Everything on this page
              <br />
              is running right now
            </h2>
            <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
              Each card below is the real component in a sandboxed frame — hover it, scroll it,
              watch it animate. What you see is what lands in your repo.
            </p>
          </div>

          <Link
            href="/community/components/featured"
            className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            See all components
            <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((component, index) => (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: (index % 3) * 0.09, ease }}
              className={cn(index === 0 && "sm:col-span-2 lg:col-span-2")}
            >
              <Link href={componentHref(component)} className="group block">
                <ComponentPreview
                  previewKey={component.previewKey}
                  frameWidth={component.previewWidth ?? 1200}
                  aspect={index === 0 ? 16 / 9 : 4 / 3}
                  className="transition-colors duration-300 group-hover:border-border-strong"
                />
                <div className="mt-3 flex items-center justify-between gap-3 px-0.5">
                  <span className="truncate text-[13px] font-medium text-foreground/90">
                    {component.name}
                  </span>
                  <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">
                    {formatCount(component.bookmarks)}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">
      <span aria-hidden className="h-px w-6 bg-brand/50" />
      {children}
    </span>
  )
}
