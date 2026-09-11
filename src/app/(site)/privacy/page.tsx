import type { Metadata } from "next"
import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = { title: "Privacy Policy" }

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="1 September 2026"
      sections={[
        {
          heading: "What we collect",
          body: [
            "Account details you give us — your email address, handle and, if you connect one, your GitHub or Google identity.",
            "Product usage: which components you view, copy, install and bookmark. We use this to rank the catalogue and to pay out to authors.",
            "Standard request logs, including IP address and user agent, kept for 30 days for abuse prevention.",
          ],
        },
        {
          heading: "What we don't do",
          body: [
            "We do not sell personal data, and we do not share it with advertisers.",
            "We do not read private repositories. Design Bug Bot only sees the diff of pull requests in repositories you install it on.",
          ],
        },
        {
          heading: "Cookies",
          body: [
            "We set a session cookie when you sign in and a preference cookie for your theme. Analytics cookies are only set if you accept them.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You can export or delete your account data at any time from settings. Deleting an account removes your published components after a 30-day grace period.",
            "Write to privacy@nuxus.dev for anything this policy doesn't answer.",
          ],
        },
      ]}
    />
  )
}
