"use client"

import { createAuthClient } from "better-auth/react"
import { magicLinkClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL ?? undefined,
  plugins: [magicLinkClient()],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  sendVerificationEmail,
  changePassword,
  changeEmail,
  updateUser,
  deleteUser,
} = authClient

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof authClient.getSession>>["data"]
>["user"]
