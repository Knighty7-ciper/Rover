import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Users, DollarSign } from "lucide-react"
import { format } from "date-fns"
import type { Project } from "@/lib/types"

interface ProjectCardProps {
  project: Project
}

const statusColors: Record<string, string> = {
  planning: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  on_hold: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  critical: "bg-red-100 text-red-600",
}

export function ProjectCard({ project }: ProjectCardProps) {
  const leadInitials =
    project.lead?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?"

  const budgetPercentage =
    project.budget_allocated > 0 ? Math.round((project.budget_spent / project.budget_allocated) * 100) : 0

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
              <p className="text-sm text-muted-foreground">{project.department}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Badge className={statusColors[project.status]} variant="secondary">
                {project.status.replace("_", " ")}
              </Badge>
              <Badge className={priorityColors[project.priority]} variant="secondary">
                {project.priority}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description && <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>}

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{project.progress_percentage}%</span>
            </div>
            <Progress value={project.progress_percentage} className="h-2" />
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Budget
              </span>
              <span className="font-medium">
                KES {project.budget_spent.toLocaleString()} / {project.budget_allocated.toLocaleString()}
              </span>
            </div>
            <Progress value={budgetPercentage} className={`h-2 ${budgetPercentage > 90 ? "[&>div]:bg-red-500" : ""}`} />
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">{leadInitials}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{project.lead?.full_name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {project.target_end_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(project.target_end_date), "MMM d")}
                </span>
              )}
              {project.members && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {project.members.length}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
