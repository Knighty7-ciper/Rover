"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ImageIcon, FileText, Milestone } from "lucide-react"
import { useRouter } from "next/navigation"
import { MentionInput } from "@/components/social/mention-input"
import { useToast } from "@/hooks/use-toast"
import type { Profile } from "@/lib/types"

interface CreatePostProps {
  profile: Profile | null
  userId: string
}

export function CreatePost({ profile, userId }: CreatePostProps) {
  const [content, setContent] = useState("")
  const [contentType, setContentType] = useState<"text" | "milestone" | "announcement">("text")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  const parseMentions = (text: string) => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }
    return mentions
  }

  const parseTags = (text: string) => {
    const tagRegex = /#(\w+)/g
    const tags = []
    let match
    
    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[1])
    }
    return [...new Set(tags)] // Remove duplicates
  }

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      // Extract mentions and tags from content
      const mentionedUsernames = parseMentions(content)
      const extractedTags = parseTags(content)

      // Insert post
      const { data: postData, error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: userId,
          content: content.trim(),
          content_type: contentType,
          media_urls: [], // TODO: Add media upload support
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      const postId = postData.id

      // Process tags
      if (extractedTags.length > 0) {
        for (const tagName of extractedTags) {
          // Insert or get existing tag
          const { data: tagData, error: tagError } = await supabase
            .from("tags")
            .insert({
              name: tagName.toLowerCase(),
            })
            .select()
            .single()

          if (tagError && !tagError.message.includes('duplicate')) {
            console.error("Error creating tag:", tagError)
          } else if (tagData) {
            // Create post_tag relationship
            await supabase
              .from("post_tags")
              .insert({
                post_id: postId,
                tag_id: tagData.id,
              })

            // Update tag posts_count
            await supabase.rpc('increment_tag_posts_count', {
              tag_id: tagData.id
            })
          }
        }
      }

      // Process mentions
      if (mentionedUsernames.length > 0) {
        // Get mentioned users by username/email
        const { data: mentionedUsers } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .or(`full_name.ilike.%${mentionedUsernames.join("%,")}%`)

        if (mentionedUsers && mentionedUsers.length > 0) {
          for (const mentionedUser of mentionedUsers) {
            if (mentionedUser.id !== userId) { // Don't notify self
              // Create mention record
              await supabase
                .from("mentions")
                .insert({
                  post_id: postId,
                  mentioned_user_id: mentionedUser.id,
                })

              // Create notification for mentioned user
              await supabase.rpc('create_notification', {
                p_user_id: mentionedUser.id,
                p_actor_id: userId,
                p_type: 'mention',
                p_title: 'You were mentioned',
                p_message: `${profile?.full_name} mentioned you in a post`,
                p_entity_type: 'post',
                p_entity_id: postId
              })
            }
          }
        }
      }

      // Clear form
      setContent("")
      setContentType("text")
      
      // Refresh the page to show new post
      router.refresh()
      
      toast({
        title: "Success",
        description: "Post created successfully",
      })

    } catch (error: any) {
      console.error("Error creating post:", error)
      setError(error.message || "Failed to create post")
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mb-4 p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <MentionInput
            value={content}
            onChange={setContent}
            placeholder="Share an update... Use @name to mention and #tag for topics"
            className="min-h-[80px] resize-none border-0 bg-muted/30 focus-visible:ring-1"
          />

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex gap-1">
              <Button
                variant={contentType === "text" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setContentType("text")}
                type="button"
              >
                <FileText className="mr-1 h-4 w-4" />
                Post
              </Button>
              <Button
                variant={contentType === "milestone" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setContentType("milestone")}
                type="button"
              >
                <Milestone className="mr-1 h-4 w-4" />
                Milestone
              </Button>
              <Button
                variant={contentType === "announcement" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setContentType("announcement")}
                type="button"
              >
                <ImageIcon className="mr-1 h-4 w-4" />
                Media
              </Button>
            </div>
            <Button onClick={handleSubmit} disabled={!content.trim() || isSubmitting} size="sm">
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
