import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationList } from "@/components/notifications/notification-list"
import { NotificationsHeader } from "@/components/notifications/notifications-header"

export default async function NotificationsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      actor:profiles!notifications_actor_id_fkey(id, full_name, title, avatar_url)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <NotificationsHeader 
        unreadCount={unreadCount || 0}
        userId={user.id}
      />
      
      <div className="mt-6">
        <NotificationList 
          notifications={notifications || []}
          userId={user.id}
        />
      </div>
    </div>
  )
}