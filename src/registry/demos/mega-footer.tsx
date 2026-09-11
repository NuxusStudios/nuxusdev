import { MegaFooter } from "@/registry/components/mega-footer"

const columns = [
  { title: "Product", links: [{ label: "Overview", href: "#" }, { label: "Components", href: "#" }, { label: "Templates", href: "#" }, { label: "Changelog", href: "#", badge: "New" }] },
  { title: "Developers", links: [{ label: "Documentation", href: "#" }, { label: "API reference", href: "#" }, { label: "CLI", href: "#" }, { label: "Status", href: "#" }] },
  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }, { label: "Careers", href: "#", badge: "3" }, { label: "Contact", href: "#" }] },
  { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }, { label: "Security", href: "#" }, { label: "DPA", href: "#" }] },
]

export default function DemoMegaFooter() {
  return <MegaFooter columns={columns} brand="Acme" />
}
