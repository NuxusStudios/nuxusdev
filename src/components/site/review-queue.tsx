"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/input"
import { approveSubmission, rejectSubmission, type PendingSubmission } from "@/server/actions/review"
import { cn } from "@/lib/utils"

/**
 * The queue the Nuxus team works through.
 *
 * Submissions are shown with their source in full rather than behind a link.
 * The decision being made is about the code, and a reviewer who has to open a
 * second page to see it will approve on the description instead.
 *
 * The source is rendered into a `<pre>` as text and never executed. React
 * escapes it on the way in, which is the same guarantee the public component
 * page relies on.
 */
export function ReviewQueue({ submissions }: { submissions: PendingSubmission[] }) {
  const router = useRouter()
  const [openId, setOpenId] = React.useState<string | null>(submissions[0]?.id ?? null)
  const [notes, setNotes] = React.useState<Record<string, string>>({})
  const [busy, setBusy] = React.useState<string | null>(null)

  const decide = async (id: string, action: "approve" | "reject") => {
    setBusy(`${id}:${action}`)
    const note = notes[id]?.trim() || undefined

    const result =
      action === "approve"
        ? await approveSubmission({ componentId: id, note })
        : await rejectSubmission({ componentId: id, note })

    setBusy(null)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success(action === "approve" ? "Published" : "Declined", {
      description:
        action === "approve"
          ? "It is live in the registry now."
          : "The author can see your reason.",
    })
    router.refresh()
  }

  if (submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        <p className="text-[15px] font-medium">Nothing waiting</p>
        <p className="mt-1.5 text-[13px] text-muted-foreground">
          Every submission has been reviewed.
        </p>
      </div>
    )
  }

  return (
    <ol className="flex flex-col gap-4">
      {submissions.map((item) => {
        const open = openId === item.id
        const waiting = item.waitingDays

        return (
          <li key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
              className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-foreground/[0.02]"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold tracking-tight">{item.name}</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {item.authorHandle ? (
                    <Link
                      href={`/@${item.authorHandle}`}
                      className="underline-offset-4 hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      @{item.authorHandle}
                    </Link>
                  ) : (
                    item.authorEmail
                  )}
                  {" · "}
                  {waiting === 0 ? "today" : waiting === 1 ? "1 day ago" : `${waiting} days ago`}
                  {" · "}
                  {item.license}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground",
                  waiting >= 7 && "border-destructive/40 text-destructive"
                )}
              >
                {waiting >= 7 ? "overdue" : "pending"}
              </span>
            </button>

            {open && (
              <div className="border-t border-border p-5">
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.dependencies.map((dep) => (
                    <span
                      key={dep}
                      className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {dep}
                    </span>
                  ))}
                </div>

                {item.sourceUrl && (
                  <p className="mt-3 text-[13px]">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      {item.sourceUrl}
                    </a>
                  </p>
                )}

                {[
                  ["Component", item.code],
                  ["Demo", item.demoCode],
                ].map(([label, source]) => (
                  <div key={label} className="mt-4">
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
                    <pre className="max-h-80 overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-[12px] leading-relaxed">
                      {source}
                    </pre>
                  </div>
                ))}

                <div className="mt-5 grid gap-3">
                  <Textarea
                    value={notes[item.id] ?? ""}
                    onChange={(event) =>
                      setNotes((prev) => ({ ...prev, [item.id]: event.target.value }))
                    }
                    placeholder="Reason — required to decline, optional to approve. The author sees this."
                    rows={2}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => decide(item.id, "approve")}
                      disabled={busy !== null}
                    >
                      {busy === `${item.id}:approve` ? (
                        <Loader2 aria-hidden className="size-4 animate-spin" />
                      ) : (
                        <Check aria-hidden className="size-4" />
                      )}
                      Publish
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => decide(item.id, "reject")}
                      disabled={busy !== null}
                    >
                      {busy === `${item.id}:reject` ? (
                        <Loader2 aria-hidden className="size-4 animate-spin" />
                      ) : (
                        <X aria-hidden className="size-4" />
                      )}
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
