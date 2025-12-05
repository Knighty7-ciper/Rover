import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { StatsCards } from "@/components/admin/stats-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users } from "lucide-react"
import type { Profile, PlatformStats } from "@/lib/types"

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Check if user is admin
  if (profile?.role !== "admin") {
    redirect("/feed")
  }

  // Fetch stats
  const [
    { count: totalUsers },
    { count: totalPosts },
    { count: totalProjects },
    { count: totalMessages },
    { count: pendingReports },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ])

  // Get today's activity
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count: postsToday } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today.toISOString())

  const stats: PlatformStats = {
    total_users: totalUsers || 0,
    total_posts: totalPosts || 0,
    total_projects: totalProjects || 0,
    total_messages: totalMessages || 0,
    active_users_today: 0,
    posts_today: postsToday || 0,
    pending_reports: pendingReports || 0,
  }

  // Recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <AdminLayout profile={profile as Profile} currentPath="/admin">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Recent Activity */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.department}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.role}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Posts Today</span>
                <span className="font-bold">{stats.posts_today}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending Reports</span>
                <span className={`font-bold ${stats.pending_reports > 0 ? "text-red-600" : ""}`}>
                  {stats.pending_reports}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Projects</span>
                <span className="font-bold">{stats.total_projects}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
