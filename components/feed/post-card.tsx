"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Heart, MessageCircle, Share2, MoreHorizontal, Send, Milestone, Megaphone } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"
import { RenderedContent } from "@/components/social/rendered-content"
import Link from "next/link"
import type { Post, Comment } from "@/lib/types"

interface PostCardProps {
  post: Post
  currentUserId: string
  initialComments?: Comment[]
}

export function PostCard({ post, currentUserId, initialComments = [] }: PostCardProps) {
  const [liked, setLiked] = useState(post.user_has_liked || false)
  const [likesCount, setLikesCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const authorInitials =
    post.profiles?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  const handleLike = async () => {
    const supabase = createClient()

    if (liked) {
      await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", currentUserId)
      setLikesCount((prev) => prev - 1)
    } else {
      await supabase.from("likes").insert({ post_id: post.id, user_id: currentUserId })
      setLikesCount((prev) => prev + 1)
    }
    setLiked(!liked)
  }

  const handleComment = async () => {
    if (!newComment.trim()) return
    setIsSubmitting(true)

    const supabase = createClient()
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment.trim(),
      })
      .select("*, profiles(*)")
      .single()

    if (!error && data) {
      setComments((prev) => [...prev, data as Comment])
      setNewComment("")
    }
    setIsSubmitting(false)
    router.refresh()
  }

  const loadComments = async () => {
    if (comments.length === 0 && post.comments_count > 0) {
      const supabase = createClient()
      const { data } = await supabase
        .from("comments")
        .select("*, profiles(*)")
        .eq("post_id", post.id)
        .order("created_at", { ascending: true })

      if (data) {
        setComments(data as Comment[])
      }
    }
    setShowComments(!showComments)
  }

  const getPostTypeIcon = () => {
    switch (post.content_type) {
      case "milestone":
        return <Milestone className="h-4 w-4 text-green-600" />
      case "announcement":
        return <Megaphone className="h-4 w-4 text-blue-600" />
      default:
        return null
    }
  }

  const getPostTypeBadge = () => {
    switch (post.content_type) {
      case "milestone":
        return <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Milestone</span>
      case "announcement":
        return <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Announcement</span>
      default:
        return null
    }
  }

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Link href={`/profile/${post.user_id}`}>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarFallback className="bg-primary text-primary-foreground">{authorInitials}</AvatarFallback>
              </Avatar>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Link href={`/profile/${post.user_id}`} className="font-semibold text-foreground hover:underline">
                  {post.profiles?.full_name || "Unknown User"}
                </Link>
                {getPostTypeIcon()}
                {getPostTypeBadge()}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{post.profiles?.title}</span>
                {post.profiles?.department && (
                  <>
                    <span>·</span>
                    <span>{post.profiles?.department}</span>
                  </>
                )}
                <span>·</span>
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Content - now with rendered mentions and tags */}
        <div className="mt-3">
          <RenderedContent content={post.content} />
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-1 border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={liked ? "text-red-500 hover:text-red-600" : ""}
          >
            <Heart className={`mr-1 h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {likesCount > 0 && likesCount}
          </Button>
          <Button variant="ghost" size="sm" onClick={loadComments}>
            <MessageCircle className="mr-1 h-4 w-4" />
            {post.comments_count > 0 && post.comments_count}
          </Button>
          <Button variant="ghost" size="sm">
            <Share2 className="mr-1 h-4 w-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 border-t border-border pt-3">
            {comments.map((comment) => (
              <div key={comment.id} className="mb-3 flex gap-2">
                <Link href={`/profile/${comment.user_id}`}>
                  <Avatar className="h-8 w-8 cursor-pointer">
                    <AvatarFallback className="bg-muted text-xs">
                      {comment.profiles?.full_name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 rounded-lg bg-muted/50 px-3 py-2">
                  <Link
                    href={`/profile/${comment.user_id}`}
                    className="text-sm font-medium text-foreground hover:underline"
                  >
                    {comment.profiles?.full_name || "Unknown"}
                  </Link>
                  <p className="text-sm text-foreground">{comment.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}

            {/* Add Comment */}
            <div className="flex gap-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">ME</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 gap-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[40px] flex-1 resize-none py-2"
                  rows={1}
                />
                <Button size="icon" onClick={handleComment} disabled={!newComment.trim() || isSubmitting}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
