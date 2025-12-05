"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Profile } from "@/lib/types"

interface UserCardProps {
  profile: Profile
  currentUserId: string
  isFollowing?: boolean
}

export function UserCard({ profile, currentUserId, isFollowing: initialFollowing = false }: UserCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const initials =
    profile.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U"

  const isOwnProfile = profile.id === currentUserId

  const handleFollow = async () => {
    setIsLoading(true)
    const supabase = createClient()

    if (isFollowing) {
      await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", profile.id)
      setIsFollowing(false)
    } else {
      await supabase.from("follows").insert({
        follower_id: currentUserId,
        following_id: profile.id,
      })
      setIsFollowing(true)
    }

    setIsLoading(false)
    router.refresh()
  }

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Link href={`/profile/${profile.id}`}>
          <Avatar className="h-12 w-12 cursor-pointer">
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${profile.id}`} className="font-semibold text-foreground hover:underline">
              {profile.full_name}
            </Link>
            {profile.is_verified && (
              <Badge variant="secondary" className="text-xs">
                Verified
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{profile.title}</p>
          <p className="text-xs text-muted-foreground">{profile.department}</p>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span>
              <strong>{profile.followers_count}</strong> followers
            </span>
            <span>
              <strong>{profile.following_count}</strong> following
            </span>
          </div>
        </div>
        {!isOwnProfile && (
          <Button variant={isFollowing ? "outline" : "default"} size="sm" onClick={handleFollow} disabled={isLoading}>
            {isFollowing ? "Following" : "Follow"}
          </Button>
        )}
      </div>
    </Card>
  )
}
