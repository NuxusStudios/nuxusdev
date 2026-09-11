import { Suspense } from "react"
import type { Metadata } from "next"
import { PasswordResetForm } from "@/components/site/password-reset"

export const metadata: Metadata = { title: "Choose a new password" }

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <PasswordResetForm />
    </Suspense>
  )
}
