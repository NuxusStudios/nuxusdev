import { TicketButton } from "@/registry/components/ticket-button"

export default function DemoTicketButton() {
  return (
    <div className="flex min-h-[260px] w-full flex-col items-center justify-center gap-5 bg-background p-8">
      <TicketButton>Claim your seat</TicketButton>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <TicketButton stub="50% OFF" stubWidth="6.5rem">
          Early access
        </TicketButton>
        <TicketButton stub="SOLD" disabled>
          Workshop pass
        </TicketButton>
      </div>
    </div>
  )
}
