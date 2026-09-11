import { cn } from "@/lib/utils"

export interface TeamMember {
  name: string
  role: string
  image?: string
  color?: string
  links?: { label: string; href: string }[]
}

export function TeamGrid({
  members,
  title = "The team",
  description,
  className,
}: {
  members: TeamMember[]
  title?: string
  description?: string
  className?: string
}) {
  return (
    <section className={cn("mx-auto w-full max-w-5xl px-6 py-14", className)}>
      <div className="max-w-xl">
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="mt-3 text-foreground/45">{description}</p>}
      </div>

      <ul className="mt-9 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
        {members.map((member) => (
          <li key={member.name} className="group">
            <div
              className="flex aspect-[4/5] items-end overflow-hidden rounded-2xl border border-foreground/10 p-4"
              style={{
                background: member.image
                  ? undefined
                  : `linear-gradient(160deg, ${member.color ?? "#3f3f46"}, transparent 70%)`,
              }}
            >
              {member.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.image} alt={member.name} className="size-full object-cover" />
              ) : (
                <span className="text-4xl font-semibold tracking-tighter text-foreground/25">
                  {member.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
              )}
            </div>
            <h3 className="mt-3 text-[15px] font-medium text-foreground">{member.name}</h3>
            <p className="text-sm text-foreground/40">{member.role}</p>
            {member.links && (
              <div className="mt-2 flex gap-3">
                {member.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-xs text-foreground/35 underline-offset-4 transition hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
