"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { listBookmarkedIds, toggleBookmark } from "@/server/actions/bookmarks"

interface BookmarkStore {
  ready: boolean
  signedIn: boolean
  has: (componentId: string) => boolean
  toggle: (componentId: string, name?: string) => Promise<void>
}

const Context = React.createContext<BookmarkStore | null>(null)

const EMPTY: ReadonlySet<string> = new Set()

/**
 * Loads the signed-in user's bookmarks once and shares them with every card on
 * the page, so a grid of 40 components makes one query rather than 40.
 */
export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [loaded, setLoaded] = React.useState<{ userId: string; ids: Set<string> } | null>(null)

  const userId = session?.user.id ?? null

  // signed-out and stale-user states are derived, never written from the effect
  const ids = loaded?.userId === userId ? loaded.ids : EMPTY
  const ready = !isPending && (!userId || loaded?.userId === userId)

  React.useEffect(() => {
    if (!userId) return

    let cancelled = false
    listBookmarkedIds().then((result) => {
      if (cancelled) return
      setLoaded({ userId, ids: result.ok ? new Set(result.data) : new Set() })
    })

    return () => {
      cancelled = true
    }
  }, [userId])

  const toggle = React.useCallback(
    async (componentId: string, name?: string) => {
      if (!session) {
        toast("Sign in to save components", {
          action: { label: "Sign in", onClick: () => router.push("/sign-in") },
        })
        return
      }

      // optimistic — reverted below if the server disagrees
      const wasSaved = ids.has(componentId)
      const apply = (add: boolean) =>
        setLoaded((current) => {
          if (!current || current.userId !== userId) return current
          const next = new Set(current.ids)
          if (add) next.add(componentId)
          else next.delete(componentId)
          return { userId: current.userId, ids: next }
        })

      apply(!wasSaved)

      const result = await toggleBookmark(componentId)

      if (!result.ok) {
        apply(wasSaved)
        toast.error(result.error)
        return
      }

      toast(result.data.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks", {
        description: name,
      })
    },
    [session, ids, userId, router]
  )

  const value = React.useMemo<BookmarkStore>(
    () => ({
      ready,
      signedIn: Boolean(session),
      has: (componentId: string) => ids.has(componentId),
      toggle,
    }),
    [ready, session, ids, toggle]
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

/** Falls back to a no-op store so cards work outside the provider. */
export function useBookmarks(): BookmarkStore {
  const context = React.useContext(Context)
  const router = useRouter()

  return React.useMemo(
    () =>
      context ?? {
        ready: true,
        signedIn: false,
        has: () => false,
        toggle: async () => {
          toast("Sign in to save components", {
            action: { label: "Sign in", onClick: () => router.push("/sign-in") },
          })
        },
      },
    [context, router]
  )
}
