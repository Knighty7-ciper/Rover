import { PostCard } from "./post-card"
import type { Post } from "@/lib/types"

interface PostListProps {
  posts: Post[]
  currentUserId: string
}

export function PostList({ posts, currentUserId }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No posts yet. Be the first to share an update!</p>
      </div>
    )
  }

  return (
    <div>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUserId={currentUserId} />
      ))}
    </div>
  )
}
