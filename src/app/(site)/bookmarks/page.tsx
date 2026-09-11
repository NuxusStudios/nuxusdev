import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site/site-header"
import { BookmarkLists } from "@/components/site/bookmark-lists"
import { Button } from "@/components/ui/button"
import { listCollections } from "@/server/actions/collections"
import { getSession } from "@/server/session"

export const metadata: Metadata = { title: "Bookmarks" }

// reads per-user data — never cache
export const dynamic = "force-dynamic"

export default async function BookmarksPage() {
  const session = await getSession()

  // middleware already redirects, this is the authoritative check
  if (!session) {
    return (
      <>
        <SiteHeader />
        <div className="container-page flex flex-col items-center py-32 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to see your bookmarks</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Lists are tied to your account so they follow you between machines.
          </p>
          <Button asChild className="mt-6">
            <Link href="/sign-in?next=/bookmarks">Sign in</Link>
          </Button>
        </div>
      </>
    )
  }

  const lists = await listCollections()

  return (
    <>
      <SiteHeader />
      <div className="container-page py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Bookmarks</h1>
        <p className="mt-2 max-w-xl text-[15px] text-muted-foreground">
          Your saved components, grouped into lists.
        </p>

        <BookmarkLists lists={lists} />
      </div>
    </>
  )
}
