import { NotificationList } from "@/registry/components/notification-list"

const items = [
  { id: 1, name: "Payment received", description: "Magic UI · $2,400", time: "15m", icon: "💸", color: "#00C9A7" },
  { id: 2, name: "New follower", description: "@kaito started following you", time: "10m", icon: "👤", color: "#FFB800" },
  { id: 3, name: "Component published", description: "Shimmer Button is live", time: "5m", icon: "✨", color: "#FF3D71" },
  { id: 4, name: "Bug bot review", description: "3 findings on PR #148", time: "2m", icon: "🐛", color: "#1E86FF" },
  { id: 5, name: "Bookmark", description: "Nova saved Aurora Background", time: "now", icon: "🔖", color: "#7c5cff" },
]

export default function DemoNotificationList() {
  return (
    <div className="flex min-h-[360px] items-center justify-center overflow-hidden p-8">
      <NotificationList items={items} />
    </div>
  )
}
