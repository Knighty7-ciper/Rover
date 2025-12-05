import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { MilestoneList } from "@/components/milestones/milestone-list"
import { AddMilestoneDialog } from "@/components/milestones/add-milestone-dialog"
import { BudgetTracker } from "@/components/milestones/budget-tracker"
import { ProjectUpdates } from "@/components/milestones/project-updates"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calendar, Users, Target, Building2 } from "lucide-react"
import { format } from "date-fns"
import type { Profile, Project, Milestone, ProjectUpdate, BudgetTransaction, ProjectMember } from "@/lib/types"

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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Fetch project with all related data
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(`
      *,
      lead:profiles!projects_lead_id_fkey(*)
    `)
    .eq("id", id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Fetch milestones
  const { data: milestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", id)
    .order("order_index", { ascending: true })

  // Fetch project members
  const { data: members } = await supabase.from("project_members").select("*, profiles(*)").eq("project_id", id)

  // Fetch updates
  const { data: updates } = await supabase
    .from("project_updates")
    .select("*, author:profiles(*), milestone:milestones(*)")
    .eq("project_id", id)
    .order("created_at", { ascending: false })

  // Fetch budget transactions
  const { data: transactions } = await supabase
    .from("budget_transactions")
    .select("*, recorder:profiles(*)")
    .eq("project_id", id)
    .order("transaction_date", { ascending: false })

  const typedProject = project as Project
  const typedMilestones = (milestones as Milestone[]) || []
  const typedMembers = (members as ProjectMember[]) || []
  const typedUpdates = (updates as ProjectUpdate[]) || []
  const typedTransactions = (transactions as BudgetTransaction[]) || []

  const isLead = typedProject.lead_id === userData.user.id
  const isMember = typedMembers.some((m) => m.user_id === userData.user.id)
  const canEdit = isLead || isMember

  const leadInitials =
    typedProject.lead?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?"

  return (
    <FeedLayout profile={profile as Profile | null} currentPath="/projects">
      {/* Back Button */}
      <Link href="/projects">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
      </Link>

      {/* Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={statusColors[typedProject.status]} variant="secondary">
                  {typedProject.status.replace("_", " ")}
                </Badge>
                <Badge className={priorityColors[typedProject.priority]} variant="secondary">
                  {typedProject.priority} priority
                </Badge>
              </div>
              <h1 className="text-2xl font-bold text-foreground">{typedProject.name}</h1>
              {typedProject.description && <p className="mt-2 text-muted-foreground">{typedProject.description}</p>}
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                {typedProject.department}
              </div>
              {typedProject.target_end_date && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Target: {format(new Date(typedProject.target_end_date), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="font-bold">{typedProject.progress_percentage}%</span>
            </div>
            <Progress value={typedProject.progress_percentage} className="h-3" />
          </div>

          {/* Lead & Team */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{leadInitials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{typedProject.lead?.full_name}</p>
                <p className="text-xs text-muted-foreground">Project Lead</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {typedMembers.length} team member{typedMembers.length !== 1 ? "s" : ""}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Milestones
              </CardTitle>
              {canEdit && <AddMilestoneDialog projectId={typedProject.id} currentOrder={typedMilestones.length} />}
            </CardHeader>
            <CardContent>
              {typedMilestones.length > 0 ? (
                <MilestoneList milestones={typedMilestones} projectId={typedProject.id} canEdit={canEdit} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No milestones yet</p>
                  {canEdit && <p className="text-sm">Add milestones to track progress</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Updates */}
          <ProjectUpdates
            projectId={typedProject.id}
            updates={typedUpdates}
            milestones={typedMilestones}
            currentUserId={userData.user.id}
            canPost={canEdit}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget */}
          <BudgetTracker
            project={typedProject}
            transactions={typedTransactions}
            currentUserId={userData.user.id}
            canEdit={canEdit}
          />

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {typedMembers.map((member) => {
                  const initials =
                    member.profiles?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "?"

                  return (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{member.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </FeedLayout>
  )
}
