import Link from "next/link"
import { LogoMark } from "@/components/site/logo"
import { BRAND } from "@/lib/brand"
import { ThemeToggle } from "@/components/site/theme-toggle"

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Components", href: "/community/components/featured" },
      { label: "Templates", href: "/templates" },
      { label: "Themes", href: "/themes" },
      { label: "Icons", href: "/icons" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Publish", href: "/publish" },
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/changelog" },
      { label: "Authors", href: "/community/authors" },
      { label: "Libraries", href: "/community/libraries" },
      { label: "Registries", href: "/community/registries" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "X (Twitter)", href: BRAND.social.x },
      { label: "GitHub", href: BRAND.social.github },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <LogoMark className="size-6" />
              <span className="text-[17px] font-semibold tracking-[-0.02em]">{BRAND.wordmark}</span>
            </div>
            <p className="max-w-[24ch] text-sm text-muted-foreground">
              {BRAND.shortDescription} Watch it run before you take it.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} {BRAND.legalName}
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
