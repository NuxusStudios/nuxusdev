"use client"

import * as React from "react"
import { Check, ChevronRight, Loader2, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { publishComponent } from "@/server/actions/publish"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { TAGS } from "@/lib/data/tags"
import { cn } from "@/lib/utils"

const STEPS = ["Code", "Details", "Categories", "Review"] as const
const LICENSES = ["MIT License", "Apache 2.0", "GPL-3.0", "All rights reserved"]

const STARTER_CODE = `"use client"

import { cn } from "@/lib/utils"

export function MyComponent({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border p-6", className)}>
      Hello from my component
    </div>
  )
}
`

const STARTER_DEMO = `import { MyComponent } from "@/components/ui/my-component"

export default function DemoMyComponent() {
  return <MyComponent />
}
`

export function PublishForm() {
  const [step, setStep] = React.useState(0)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [code, setCode] = React.useState(STARTER_CODE)
  const [demo, setDemo] = React.useState(STARTER_DEMO)
  const [license, setLicense] = React.useState(LICENSES[0])
  const [deps, setDeps] = React.useState("")
  const [tags, setTags] = React.useState<string[]>([])
  const [publishing, setPublishing] = React.useState(false)
  const router = useRouter()

  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const canContinue =
    step === 0 ? code.trim().length > 20 && demo.trim().length > 10
    : step === 1 ? name.trim().length > 2 && description.trim().length > 8
    : step === 2 ? tags.length > 0
    : true

  async function publish() {
    setPublishing(true)

    const result = await publishComponent({
      name,
      description,
      code,
      demoCode: demo,
      tags,
      dependencies: deps
        .split(",")
        .map((dep) => dep.trim())
        .filter(Boolean),
      license: license as "MIT License" | "Apache 2.0" | "GPL-3.0" | "All rights reserved",
      status: "published",
    })

    setPublishing(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    toast.success("Component published", {
      description: `${name} is live under your handle.`,
    })
    router.push(`/@${result.data.handle}/components/${result.data.slug}`)
    router.refresh()
  }

  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <ol className="mb-8 flex flex-wrap items-center gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                  i === step
                    ? "bg-secondary font-medium text-foreground"
                    : i < step
                      ? "text-foreground/70 hover:text-foreground"
                      : "text-muted-foreground/50"
                )}
              >
                <span
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full text-[11px]",
                    i < step
                      ? "bg-emerald-500/15 text-emerald-400"
                      : i === step
                        ? "bg-foreground text-background"
                        : "border border-border"
                  )}
                >
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                {label}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="size-3.5 text-muted-foreground/30" />}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="grid gap-5">
            <Field label="Component code" hint="Lands in components/ui/ in the consumer's project.">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="min-h-[240px] font-mono text-[12.5px]"
              />
            </Field>
            <Field label="Demo code" hint="Must default-export a component that renders yours.">
              <Textarea
                value={demo}
                onChange={(e) => setDemo(e.target.value)}
                spellCheck={false}
                className="min-h-[140px] font-mono text-[12.5px]"
              />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-5">
            <Field label="Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Shimmer Button" />
            </Field>
            <Field label="Description" hint="One sentence. It shows up in search and on the card.">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A button with a conic-gradient shimmer that orbits the border on a loop."
                className="min-h-[80px]"
              />
            </Field>
            <Field label="npm dependencies" hint="Comma separated. Leave blank if it has none.">
              <Input value={deps} onChange={(e) => setDeps(e.target.value)} placeholder="motion, lucide-react" />
            </Field>
            <Field label="License">
              <div className="flex flex-wrap gap-2">
                {LICENSES.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLicense(l)}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-[13px] transition-colors",
                      license === l
                        ? "border-border-strong bg-secondary text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="mb-3 text-sm text-muted-foreground">
              Pick up to five categories — they decide where your component shows up.
            </p>
            <div className="flex max-h-[420px] flex-wrap gap-2 overflow-y-auto rounded-xl border border-border p-4">
              {TAGS.map((tag) => {
                const on = tags.includes(tag.slug)
                return (
                  <button
                    key={tag.slug}
                    onClick={() =>
                      setTags((cur) =>
                        on ? cur.filter((t) => t !== tag.slug) : cur.length < 5 ? [...cur, tag.slug] : cur
                      )
                    }
                    className={cn(
                      "rounded-full border px-3 py-1 text-[13px] transition-colors",
                      on
                        ? "border-brand/40 bg-brand/15 text-brand"
                        : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                    )}
                  >
                    {tag.name}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{tags.length}/5 selected</p>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-[15px] font-semibold">{name || "Untitled component"}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {description || "No description yet."}
              </p>
              <dl className="mt-4 grid gap-2 text-[13px] sm:grid-cols-2">
                <Row label="URL" value={`/@you/components/${slug || "untitled"}`} />
                <Row label="License" value={license} />
                <Row label="Dependencies" value={deps || "none"} />
                <Row label="Categories" value={tags.join(", ") || "none"} />
                <Row label="Component" value={`${code.split("\n").length} lines`} />
                <Row label="Demo" value={`${demo.split("\n").length} lines`} />
              </dl>
            </div>
            <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary/30 p-4 text-[13px] text-muted-foreground">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-brand" />
              We&apos;ll generate the prompt, the CLI command and the live preview automatically once
              you publish.
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-2">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button disabled={!canContinue} onClick={() => setStep((s) => s + 1)}>
              Continue
            </Button>
          ) : (
            <Button onClick={publish} disabled={publishing} className="gap-1.5">
              {publishing && <Loader2 className="size-4 animate-spin" />}
              {publishing ? "Publishing…" : "Publish component"}
            </Button>
          )}
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-[13px] font-semibold">Before you publish</h2>
          <ul className="mt-3 space-y-2.5 text-[13px] text-muted-foreground">
            {[
              "Use Tailwind classes, not hard-coded hex values, where you can.",
              "Import cn from @/lib/utils.",
              "Keep the demo self-contained — no external data.",
              "Add \"use client\" if you use state or effects.",
              "Name the export the same as the file.",
            ].map((tip) => (
              <li key={tip} className="flex gap-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-muted-foreground/50" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-medium">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      {children}
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-28 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground/80">{value}</dd>
    </div>
  )
}
