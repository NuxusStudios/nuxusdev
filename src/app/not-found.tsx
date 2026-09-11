import Link from "next/link"
import { SiteHeader } from "@/components/site/site-header"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
        <p className="font-mono text-[13px] text-muted-foreground">404</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          This page isn&apos;t in the registry
        </h1>
        <p className="mt-4 max-w-md text-[15px] text-muted-foreground">
          The component, author or library you were looking for may have been renamed or
          unpublished.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link href="/community/components/featured">Browse components</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
