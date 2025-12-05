import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin/admin-layout"
import { AuditLogTable } from "@/components/admin/audit-log-table"
import type { Profile, AuditLog } from "@/lib/types"

export default async function AdminAuditPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/feed")
  }

  // Fetch audit logs
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("*, user:profiles(*)")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <AdminLayout profile={profile as Profile} currentPath="/admin/audit">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">Track all administrative actions</p>
      </div>

      <AuditLogTable logs={(logs as AuditLog[]) || []} />
    </AdminLayout>
  )
}
