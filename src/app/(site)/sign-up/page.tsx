import { Suspense } from "react"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { AuthCard } from "@/components/site/auth-card"
import { providers } from "@/server/env"
import { getSession } from "@/server/session"

export const metadata: Metadata = { title: "Sign up" }

export default async function SignupPage() {
  // already signed in — no reason to show the form
  if (await getSession()) redirect("/")

  return (
    <Suspense>
      <AuthCard mode="sign-up" providers={{ ...providers }} />
    </Suspense>
  )
}
