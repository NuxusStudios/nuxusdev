"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bookmark, LogOut, Plus, Settings, User as UserIcon } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { initials } from "@/lib/utils"

export function UserMenu({ size = "sm" }: { size?: "sm" | "default" }) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [signingOut, setSigningOut] = React.useState(false)

  if (isPending) {
    return <Skeleton className="h-8 w-[104px] rounded-lg" />
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size={size} asChild className="hidden sm:inline-flex">
          <Link href="/sign-in">Log in</Link>
        </Button>
        <Button size={size} asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    )
  }

  const user = session.user
  const handle = (user as { handle?: string | null }).handle

  async function handleSignOut() {
    setSigningOut(true)
    await authClient.signOut()
    setSigningOut(false)
    toast("Signed out")
    router.push("/")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full outline-none transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Account menu"
        >
          <Avatar className="size-8">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback>{initials(user.name || user.email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="normal-case tracking-normal">
          <span className="block truncate text-[13px] font-medium text-foreground">
            {user.name || "Your account"}
          </span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {handle && (
          <DropdownMenuItem asChild>
            <Link href={`/@${handle}`}>
              <UserIcon />
              Your profile
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/bookmarks">
            <Bookmark />
            Bookmarks
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/publish">
            <Plus />
            Publish a component
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut} disabled={signingOut}>
          <LogOut />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
