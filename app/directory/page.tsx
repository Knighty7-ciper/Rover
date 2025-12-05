import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { UserCard } from "@/components/social/user-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { Profile } from "@/lib/types"

export default async function DirectoryPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch current user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Fetch all profiles
  const { data: profiles } = await supabase.from("profiles").select("*").order("full_name", { ascending: true })

  // Check which users the current user is following
  const { data: following } = await supabase.from("follows").select("following_id").eq("follower_id", userData.user.id)

  const followingIds = new Set(following?.map((f) => f.following_id) || [])

  return (
    <FeedLayout profile={profile as Profile | null} currentPath="/directory">
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Official Directory</h1>
        <p className="text-muted-foreground">Find and connect with government officials</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name, department, or title..." className="pl-9" />
      </div>

      {/* Directory Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {profiles?.map((p) => (
          <UserCard
            key={p.id}
            profile={p as Profile}
            currentUserId={userData.user.id}
            isFollowing={followingIds.has(p.id)}
          />
        ))}
      </div>

      {(!profiles || profiles.length === 0) && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">No officials found in the directory yet.</p>
        </div>
      )}
    </FeedLayout>
  )
}
