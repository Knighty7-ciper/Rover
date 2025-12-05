"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { ImageIcon, FileText, Milestone } from "lucide-react"
import { useRouter } from "next/navigation"
import { MentionInput } from "@/components/social/mention-input"
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

  const initials =
    profile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  const handleSubmit = async () => {
    if (!content.trim()) return

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    const { error: insertError } = await supabase.from("posts").insert({
      user_id: userId,
      content: content.trim(),
      content_type: contentType,
    })

    if (insertError) {
      setError(insertError.message)
      setIsSubmitting(false)
      return
    }

    setContent("")
    setContentType("text")
    setIsSubmitting(false)
    router.refresh()
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
