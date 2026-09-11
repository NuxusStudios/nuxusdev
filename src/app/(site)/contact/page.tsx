import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { ContactForm } from "@/components/site/contact-form"

export const metadata: Metadata = { title: "Contact" }

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-page py-14">
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight">Contact</h1>
            <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
              Questions about plans, publishing, or the MCP server. We answer email; priority
              support is included on Team.
            </p>
            <dl className="mt-8 grid gap-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Support</dt>
                <dd>support@nuxus.dev</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Partnerships</dt>
                <dd>hello@nuxus.dev</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Security</dt>
                <dd>security@nuxus.dev</dd>
              </div>
            </dl>
          </div>
          <ContactForm />
        </div>
      </div>
    </>
  )
}
