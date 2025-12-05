import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { CreatePost } from "@/components/feed/create-post"
import { PostList } from "@/components/feed/post-list"
import type { Post, Profile } from "@/lib/types"

export default async function FeedPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Fetch posts with author profiles and check if current user liked each post
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      profiles (*)
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20)

  // Check which posts the user has liked
  const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", userData.user.id)

  const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])

  const postsWithLikeStatus: Post[] = (posts || []).map((post) => ({
    ...post,
    user_has_liked: likedPostIds.has(post.id),
  }))

  return (
    <FeedLayout profile={profile as Profile | null} currentPath="/feed">
      <CreatePost profile={profile as Profile | null} userId={userData.user.id} />
      <PostList posts={postsWithLikeStatus} currentUserId={userData.user.id} />
    </FeedLayout>
  )
}
