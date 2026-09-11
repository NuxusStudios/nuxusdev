import { TypePortal } from "@/registry/components/type-portal"

export default function DemoTypePortal() {
  return (
    <TypePortal word="SUBLIME" caption="Scroll to enter">
      <div className="max-w-3xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight">A different way in.</h2>
        <p className="mt-4 text-lg opacity-80">
          The letter opens onto the next section — a story, a project, a reason to stay.
        </p>
      </div>
    </TypePortal>
  )
}
