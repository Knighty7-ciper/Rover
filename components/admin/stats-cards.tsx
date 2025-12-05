import { Card, CardContent } from "@/components/ui/card"
import { Users, FileText, FolderKanban, MessageSquare, TrendingUp, Flag } from "lucide-react"
import type { PlatformStats } from "@/lib/types"

interface StatsCardsProps {
  stats: PlatformStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Users",
      value: stats.total_users,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Total Posts",
      value: stats.total_posts,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Projects",
      value: stats.total_projects,
      icon: FolderKanban,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Messages",
      value: stats.total_messages,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Active Today",
      value: stats.active_users_today,
      icon: TrendingUp,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      label: "Pending Reports",
      value: stats.pending_reports,
      icon: Flag,
      color: stats.pending_reports > 0 ? "text-red-600" : "text-slate-600",
      bgColor: stats.pending_reports > 0 ? "bg-red-100" : "bg-slate-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{card.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
