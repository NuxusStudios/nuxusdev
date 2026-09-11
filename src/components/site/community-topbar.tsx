import Link from "next/link"
import { SearchCommand } from "@/components/site/search-command"
import { MobileCategoryNav } from "@/components/site/mobile-category-nav"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/site/user-menu"

export function CommunityTopBar({
  breadcrumb,
}: {
  breadcrumb?: { label: string; href?: string }[]
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/85 px-4 backdrop-blur-xl md:px-6">
      <MobileCategoryNav />

      <nav className="flex min-w-0 items-center gap-1.5 text-sm">
        {breadcrumb?.map((crumb, i) => (
          <span key={crumb.label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground/40">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="truncate font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <SearchCommand className="hidden sm:flex" />
        <Button variant="ghost" size="sm" asChild>
          <Link href="/pricing">Pricing</Link>
        </Button>
        <UserMenu />
      </div>
    </header>
  )
}
