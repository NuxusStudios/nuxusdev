import { Fragment } from "react"
import { Check, Minus } from "lucide-react"
import { BRAND } from "@/lib/brand"

interface Row {
  label: string
  builder: string | boolean
  builderAi: string | boolean
  team: string | boolean
}

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Design Bug Bot",
    rows: [
      { label: "PR design reviews with findings and fix code", builder: "Free trial", builderAi: "Included, uses AI credits", team: "With Team + AI after trial" },
      { label: "Free successful reviews in your first 7 days", builder: "5 per personal account", builderAi: "5 per personal account", team: "5 per team" },
      { label: "Continue after 5 reviews or 7 days", builder: "Add AI to continue", builderAi: "Uses AI credits automatically", team: "Uses shared credits with Team + AI" },
    ],
  },
  {
    title: "Marketplace",
    rows: [
      { label: "Browse components, themes & templates", builder: true, builderAi: true, team: true },
      { label: "Copy & install components", builder: "Unlimited", builderAi: "Unlimited", team: "Unlimited" },
      { label: "Download verified templates", builder: "Unlimited", builderAi: "Unlimited", team: "Unlimited" },
      { label: "Templates sold by authors", builder: "Bought per template", builderAi: "Bought per template", team: "Bought per template" },
      { label: "Component code retrieval via MCP", builder: "Unlimited", builderAi: "Unlimited", team: "Unlimited" },
      { label: "SVG logo search", builder: "Unlimited", builderAi: "Unlimited", team: "Unlimited" },
    ],
  },
  {
    title: `${BRAND.name} AI`,
    rows: [
      { label: "Monthly AI credits", builder: "None", builderAi: "500–2,000", team: "None or 500–2,000 / seat" },
      { label: "Buy more credits", builder: false, builderAi: "+100 for $5 (rolls over)", team: "With Team + AI: +100 for $5" },
      { label: "Sketch: multi-model comparison", builder: false, builderAi: true, team: "With Team + AI" },
      { label: "Code mode (React + live sandbox)", builder: false, builderAi: true, team: "With Team + AI" },
      { label: "Refine & iterate on a take", builder: false, builderAi: true, team: "With Team + AI" },
    ],
  },
  {
    title: "Team",
    rows: [
      { label: "Centralized billing", builder: false, builderAi: false, team: true },
      { label: "Shared team collections", builder: false, builderAi: false, team: true },
      { label: "Admin controls", builder: false, builderAi: false, team: true },
    ],
  },
  {
    title: "Support",
    rows: [{ label: "Support", builder: "Email", builderAi: "Email", team: "Priority" }],
  },
]

export function PricingCompare() {
  return (
    <section className="mt-20">
      <h2 className="text-2xl font-semibold tracking-tight">Compare plans</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Builder and Team include the full marketplace. Builder + AI adds multi-model generation and
        monthly credits.
      </p>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[760px] text-left text-[13px]">
          <thead>
            <tr className="border-b border-border">
              <th className="w-[38%] px-5 py-4 font-medium text-muted-foreground">Feature</th>
              <Th title="Builder" sub="For individuals" />
              <Th title="Builder + AI" sub="For AI generation and PR reviews" />
              <Th title="Team" sub="For teams and agencies" />
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group) => (
              <Fragment key={group.title}>
                <tr className="border-b border-border bg-secondary/20">
                  <td
                    colSpan={4}
                    className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {group.title}
                  </td>
                </tr>
                {group.rows.map((row) => (
                  <tr key={row.label} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3.5 text-foreground/85">{row.label}</td>
                    <Td value={row.builder} />
                    <Td value={row.builderAi} />
                    <Td value={row.team} />
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function Th({ title, sub }: { title: string; sub: string }) {
  return (
    <th className="w-[20.6%] px-5 py-4 align-top">
      <span className="block font-semibold">{title}</span>
      <span className="block text-[12px] font-normal text-muted-foreground">{sub}</span>
    </th>
  )
}

function Td({ value }: { value: string | boolean }) {
  return (
    <td className="px-5 py-3.5 text-muted-foreground">
      {value === true ? (
        <Check className="size-4 text-emerald-400" />
      ) : value === false ? (
        <Minus className="size-4 text-muted-foreground/40" />
      ) : (
        value
      )}
    </td>
  )
}
