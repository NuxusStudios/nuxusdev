import { SiteHeader } from "@/components/site/site-header"

export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string
  updated: string
  sections: { heading: string; body: string[] }[]
}) {
  return (
    <>
      <SiteHeader />
      <div className="container-page py-14">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>

          <div className="mt-10 flex flex-col gap-9">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold tracking-tight">{section.heading}</h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((para, i) => (
                    <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">
                      {para}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
