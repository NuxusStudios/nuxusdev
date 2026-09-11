import { FooterSection } from "@/registry/components/footer-section"

const columns = [
  { title: "Product", links: [{ label: "Components", href: "#" }, { label: "Templates", href: "#" }, { label: "Themes", href: "#" }, { label: "Pricing", href: "#" }] },
  { title: "Resources", links: [{ label: "Publish", href: "#" }, { label: "Docs", href: "#" }, { label: "Changelog", href: "#" }] },
  { title: "Company", links: [{ label: "Contact", href: "#" }, { label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
]

export default function DemoFooterSection() {
  return <FooterSection columns={columns} brand="Acme" />
}
