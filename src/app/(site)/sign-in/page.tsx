import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthCard } from "@/components/site/auth-card"
import { providers } from "@/server/env"
import { getSession } from "@/server/session"

export const metadata: Metadata = { title: "Sign in" }

export default async function SigninPage() {
  // already signed in — no reason to show the form
  if (await getSession()) redirect("/")

  return (
    <Suspense>
      <AuthCard mode="sign-in" providers={{ ...providers }} />
    </Suspense>
  )
}
