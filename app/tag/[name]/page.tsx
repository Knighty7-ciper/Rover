import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { PostCard } from "@/components/feed/post-card"
import { Card } from "@/components/ui/card"
import { Hash } from "lucide-react"
import type { Profile, Post } from "@/lib/types"

interface TagPageProps {
  params: Promise<{ name: string }>
}

export default async function TagPage({ params }: TagPageProps) {
  const { name } = await params
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch current user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Fetch tag
  const { data: tag } = await supabase.from("tags").select("*").eq("name", name.toLowerCase()).single()

  // Fetch posts with this tag (via content search for now)
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .ilike("content", `%#${name}%`)
    .order("created_at", { ascending: false })
    .limit(20)

  // Check liked posts
  const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", userData.user.id)

  const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])
  const postsWithLikeStatus: Post[] = (posts || []).map((post) => ({
    ...post,
    user_has_liked: likedPostIds.has(post.id),
  }))

  return (
    <FeedLayout profile={profile as Profile | null} currentPath="">
      {/* Tag Header */}
      <Card className="mb-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Hash className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">#{name}</h1>
            <p className="text-muted-foreground">{tag?.posts_count || posts?.length || 0} posts</p>
          </div>
        </div>
      </Card>

      {/* Posts */}
      {postsWithLikeStatus.length > 0 ? (
        postsWithLikeStatus.map((post) => <PostCard key={post.id} post={post} currentUserId={userData.user.id} />)
      ) : (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No posts with this tag yet.</p>
        </Card>
      )}
    </FeedLayout>
  )
}
