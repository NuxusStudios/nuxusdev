import type { Metadata } from "next"
import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = { title: "Terms of Service" }

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="1 September 2026"
      sections={[
        {
          heading: "The service",
          body: [
            "Nuxus is a registry where people publish React components and other people copy them. We host the catalogue, the previews and the tooling around it.",
            "Accounts are for individuals. Team plans cover a named set of seats.",
          ],
        },
        {
          heading: "Your content",
          body: [
            "You keep ownership of everything you publish. By publishing you grant us the right to host it, render a preview of it and distribute it under the license you selected.",
            "Publish only code you have the right to publish. We remove content on a valid infringement claim.",
          ],
        },
        {
          heading: "Using components",
          body: [
            "Each component carries its own license, shown on its page. That license governs what you may do with the code — not these terms.",
            "Bulk scraping of the catalogue is not permitted. Use the MCP server or the CLI.",
          ],
        },
        {
          heading: "Billing",
          body: [
            "Plans renew automatically until cancelled. Cancelling stops the next renewal and keeps access until the period ends.",
            "Payments already made are non-refundable. AI credits expire monthly unless purchased as a top-up, which rolls over.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "Components are provided as-is by their authors. We do not warrant that any component is fit for a particular purpose.",
          ],
        },
      ]}
    />
  )
}
