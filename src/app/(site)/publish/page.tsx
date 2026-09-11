import type { Metadata } from "next"
import { SiteHeader } from "@/components/site/site-header"
import { PublishForm } from "@/components/site/publish-form"

export const metadata: Metadata = {
  title: "Publish a component",
  description:
    "Publish your React component to the registry — add a demo, pick categories and a license, and it goes live with a preview and a prompt.",
}

export default function PublishPage() {
  return (
    <>
      <SiteHeader />
      <div className="container-page py-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Publish a component</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Paste your component and a demo that renders it. We build the preview, generate the
            prompt and put it in front of every builder browsing your categories.
          </p>
        </div>

        <PublishForm />
      </div>
    </>
  )
}
