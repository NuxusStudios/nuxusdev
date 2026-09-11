import { StickyNavbar } from "@/registry/components/sticky-navbar"

const links = [
  { label: "Product", href: "#" },
  { label: "Docs", href: "#" },
  { label: "Pricing", href: "#" },
  { label: "Blog", href: "#" },
]

export default function DemoStickyNavbar() {
  return (
    <div className="h-[420px] overflow-y-auto bg-background">
      <StickyNavbar links={links} />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">Scroll me</h1>
        <p className="mt-3 text-foreground/50">The header condenses and gains a blur once you move.</p>
        <div className="mt-10 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-foreground/10 bg-foreground/[0.02]" />
          ))}
        </div>
      </div>
    </div>
  )
}
