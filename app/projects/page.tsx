import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { ProjectCard } from "@/components/milestones/project-card"
import { CreateProjectDialog } from "@/components/milestones/create-project-dialog"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FolderKanban, CheckCircle } from "lucide-react"
import type { Profile, Project } from "@/lib/types"

export default async function ProjectsPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Fetch all projects with lead info
  const { data: projects } = await supabase
    .from("projects")
    .select(`
      *,
      lead:profiles!projects_lead_id_fkey(*),
      members:project_members(*)
    `)
    .order("updated_at", { ascending: false })

  const allProjects = (projects as Project[]) || []
  const activeProjects = allProjects.filter((p) => ["planning", "in_progress"].includes(p.status))
  const completedProjects = allProjects.filter((p) => p.status === "completed")
  const myProjects = allProjects.filter(
    (p) => p.lead_id === userData.user.id || p.members?.some((m) => m.user_id === userData.user.id),
  )

  return (
    <FeedLayout profile={profile as Profile | null} currentPath="/projects">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Track government initiatives and milestones</p>
        </div>
        <CreateProjectDialog currentUserId={userData.user.id} userDepartment={profile?.department || null} />
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="my">My Projects ({myProjects.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
          <TabsTrigger value="all">All ({allProjects.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No active projects</h3>
              <p className="text-sm text-muted-foreground">Create a new project to start tracking progress</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="my">
          {myProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground">You are not part of any projects</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {completedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No completed projects</h3>
              <p className="text-sm text-muted-foreground">Completed projects will appear here</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all">
          {allProjects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FolderKanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No projects</h3>
              <p className="text-sm text-muted-foreground">Create your first project to get started</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </FeedLayout>
  )
}
