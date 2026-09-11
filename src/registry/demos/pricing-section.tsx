import { PricingSection } from "@/registry/components/pricing-section"

const tiers = [
  { name: "Hobby", price: { monthly: 0, yearly: 0 }, description: "For side projects.", cta: "Start free", features: ["3 projects", "Community support", "1GB storage"] },
  { name: "Pro", price: { monthly: 24, yearly: 18 }, description: "For working developers.", cta: "Get Pro", popular: true, features: ["Unlimited projects", "Priority support", "100GB storage", "Custom domains"] },
  { name: "Team", price: { monthly: 60, yearly: 45 }, description: "For growing teams.", cta: "Get Team", features: ["Everything in Pro", "Shared collections", "SSO & SAML", "Admin controls"] },
]

export default function DemoPricingSection() {
  return <PricingSection tiers={tiers} />
}
