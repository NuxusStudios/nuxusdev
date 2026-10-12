import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site/site-header"
import { ReviewQueue } from "@/components/site/review-queue"
import { listPendingSubmissions } from "@/server/actions/review"
import { isAdmin } from "@/server/session"

export const metadata: Metadata = { title: "Review queue", robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"

/**
 * The Nuxus team's review queue.
 *
 * `notFound()` rather than a redirect or a 403 page: someone who is not on the
 * team has no reason to learn that this route exists.
 */
export default async function ReviewPage() {
  if (!(await isAdmin())) notFound()

  const result = await listPendingSubmissions()
  if (!result.ok) notFound()

  return (
    <>
      <SiteHeader />
      <div className="container-page max-w-3xl py-12">
        <h1 className="text-3xl font-semibold tracking-tight">Review queue</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          {result.data.length === 0
            ? "Nothing is waiting."
            : `${result.data.length} submission${result.data.length === 1 ? "" : "s"} waiting, oldest first.`}
        </p>

        <div className="mt-8">
          <ReviewQueue submissions={result.data} />
        </div>
      </div>
    </>
  )
}
