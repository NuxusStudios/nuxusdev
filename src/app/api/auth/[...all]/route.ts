import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/server/auth"

/** Better Auth owns every /api/auth/* endpoint. */
export const { GET, POST } = toNextJsHandler(auth.handler)
