import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { PostCard } from "@/components/feed/post-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Briefcase } from "lucide-react"
import { format } from "date-fns"
import type { Profile, Post } from "@/lib/types"

interface ProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch current user profile
  const { data: currentProfile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Fetch viewed profile
  const { data: viewedProfile } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (!viewedProfile) {
    notFound()
  }

  // Fetch user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select("*, profiles(*)")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(20)

  // Check if following
  const { data: followData } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", userData.user.id)
    .eq("following_id", id)
    .single()

  const isFollowing = !!followData
  const isOwnProfile = userData.user.id === id

  // Check liked posts
  const { data: userLikes } = await supabase.from("likes").select("post_id").eq("user_id", userData.user.id)

  const likedPostIds = new Set(userLikes?.map((l) => l.post_id) || [])
  const postsWithLikeStatus: Post[] = (posts || []).map((post) => ({
    ...post,
    user_has_liked: likedPostIds.has(post.id),
  }))

  const initials =
    viewedProfile.full_name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "U"

  return (
    <FeedLayout profile={currentProfile as Profile | null} currentPath="">
      {/* Profile Header */}
      <Card className="mb-6 overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-primary to-primary/70" />

        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <Avatar className="-mt-16 h-32 w-32 border-4 border-card">
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="mt-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{viewedProfile.full_name}</h1>
                {viewedProfile.is_verified && <Badge variant="secondary">Verified</Badge>}
              </div>
              <p className="text-muted-foreground">{viewedProfile.title}</p>

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {viewedProfile.department && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {viewedProfile.department}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Nairobi, Kenya
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined {format(new Date(viewedProfile.created_at), "MMMM yyyy")}
                </span>
              </div>

              <div className="mt-3 flex gap-4 text-sm">
                <span>
                  <strong className="text-foreground">{viewedProfile.followers_count}</strong>{" "}
                  <span className="text-muted-foreground">Followers</span>
                </span>
                <span>
                  <strong className="text-foreground">{viewedProfile.following_count}</strong>{" "}
                  <span className="text-muted-foreground">Following</span>
                </span>
              </div>
            </div>

            {!isOwnProfile && (
              <form action={`/api/follow/${id}`} method="POST">
                <Button variant={isFollowing ? "outline" : "default"}>{isFollowing ? "Following" : "Follow"}</Button>
              </form>
            )}
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList className="mb-4">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {postsWithLikeStatus.length > 0 ? (
            postsWithLikeStatus.map((post) => <PostCard key={post.id} post={post} currentUserId={userData.user.id} />)
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No posts yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="about">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-foreground">About</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-foreground">{viewedProfile.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="text-foreground">{viewedProfile.department || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title</span>
                <span className="text-foreground">{viewedProfile.title || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="outline">{viewedProfile.role}</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </FeedLayout>
  )
}
