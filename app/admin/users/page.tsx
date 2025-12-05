import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { UserManagement } from "@/components/admin/user-management"
import type { Profile } from "@/lib/types"

export default async function AdminUsersPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/feed")
  }

  // Fetch all users
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <AdminLayout profile={profile as Profile} currentPath="/admin/users">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage user accounts and permissions</p>
      </div>

      <UserManagement users={(users as Profile[]) || []} currentUserId={userData.user.id} />
    </AdminLayout>
  )
}
