import { redirect } from "next/navigation"

/** `/community` is a natural URL to type; send it to the default tab. */
export default function CommunityIndex() {
  redirect("/community/components/featured")
}
