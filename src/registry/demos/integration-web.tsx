import { IntegrationCard } from "@/registry/components/integration-web"

export default function DemoIntegrationWeb() {
  return (
    <div className="flex w-full items-center justify-center bg-background p-4 sm:p-6">
      <IntegrationCard
        title="Seamless integrations"
        description="Connect the tools you already use and keep every workflow in one place, without switching between platforms."
        href="#"
      />
    </div>
  )
}
