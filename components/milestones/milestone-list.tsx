"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Circle, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import type { Milestone } from "@/lib/types"

interface MilestoneListProps {
  milestones: Milestone[]
  projectId: string
  canEdit: boolean
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="h-5 w-5 text-slate-400" />,
  in_progress: <Clock className="h-5 w-5 text-blue-500" />,
  completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  delayed: <AlertTriangle className="h-5 w-5 text-orange-500" />,
}

const statusColors: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  delayed: "bg-orange-100 text-orange-700",
}

export function MilestoneList({ milestones, projectId, canEdit }: MilestoneListProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  const handleProgressUpdate = async (milestoneId: string, newProgress: number) => {
    setUpdating(milestoneId)
    const supabase = createClient()

    const status = newProgress === 100 ? "completed" : newProgress > 0 ? "in_progress" : "pending"
    const completedDate = newProgress === 100 ? new Date().toISOString().split("T")[0] : null

    await supabase
      .from("milestones")
      .update({
        progress_percentage: newProgress,
        status,
        completed_date: completedDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", milestoneId)

    setUpdating(null)
    router.refresh()
  }

  const sortedMilestones = [...milestones].sort((a, b) => a.order_index - b.order_index)

  return (
    <div className="space-y-3">
      {sortedMilestones.map((milestone, index) => (
        <Card key={milestone.id} className={`transition-all ${milestone.status === "completed" ? "opacity-75" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {/* Status Icon */}
              <div className="pt-0.5">{statusIcons[milestone.status]}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-foreground">
                      {index + 1}. {milestone.title}
                    </h4>
                    {milestone.target_date && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Target: {format(new Date(milestone.target_date), "MMM d, yyyy")}
                        {milestone.completed_date && (
                          <span className="text-green-600 ml-2">
                            Completed: {format(new Date(milestone.completed_date), "MMM d, yyyy")}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <Badge className={statusColors[milestone.status]} variant="secondary">
                    {milestone.status.replace("_", " ")}
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{milestone.progress_percentage}%</span>
                  </div>
                  <Progress value={milestone.progress_percentage} className="h-2" />
                </div>

                {/* Expandable Description */}
                {milestone.description && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 -ml-2 text-xs"
                    onClick={() => setExpanded(expanded === milestone.id ? null : milestone.id)}
                  >
                    {expanded === milestone.id ? (
                      <>
                        Hide details <ChevronUp className="ml-1 h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Show details <ChevronDown className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </Button>
                )}
                {expanded === milestone.id && milestone.description && (
                  <p className="mt-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {milestone.description}
                  </p>
                )}

                {/* Quick Progress Buttons */}
                {canEdit && milestone.status !== "completed" && (
                  <div className="mt-3 flex gap-2">
                    {[25, 50, 75, 100].map((val) => (
                      <Button
                        key={val}
                        variant={milestone.progress_percentage >= val ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-7"
                        disabled={updating === milestone.id}
                        onClick={() => handleProgressUpdate(milestone.id, val)}
                      >
                        {val}%
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
