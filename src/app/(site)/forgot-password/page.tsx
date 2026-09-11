import { Suspense } from "react"
import type { Metadata } from "next"
import { PasswordResetRequest } from "@/components/site/password-reset"

export const metadata: Metadata = { title: "Reset your password" }

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <PasswordResetRequest />
    </Suspense>
  )
}
