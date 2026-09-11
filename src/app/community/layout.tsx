import { CommunitySidebar } from "@/components/site/community-sidebar"

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen lg:block">
        <CommunitySidebar />
      </div>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
