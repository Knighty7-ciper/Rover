"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { UserPlus, UserCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { Profile } from "@/lib/types"

interface SuggestedConnectionsProps {
  userId: string
}

interface SuggestedUser {
  id: string
  full_name: string | null
  title: string | null
  department: string | null
  avatar_url: string | null
  followers_count: number
}

export function SuggestedConnections({ userId }: SuggestedConnectionsProps) {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([])
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchSuggestedConnections()
  }, [userId])

  const fetchSuggestedConnections = async () => {
    try {
      // Try to use the database function first
      const { data, error } = await supabase
        .rpc('get_suggested_connections', { 
          user_id: userId,
          limit_count: 5 
        })

      if (error) {
        console.error("Error fetching suggestions:", error)
        // Fallback to manual query
        const { data: allUsers, error: usersError } = await supabase
          .from("profiles")
          .select("id, full_name, title, department, avatar_url, followers_count")
          .neq("id", userId)
          .order("followers_count", { ascending: false })
          .limit(5)

        if (usersError) {
          console.error("Error fetching users:", usersError)
          setSuggestions([])
        } else {
          setSuggestions(allUsers || [])
        }
      } else {
        setSuggestions(data || [])
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFollow = async (targetUserId: string) => {
    try {
      const { error } = await supabase.rpc('follow_user', {
        follower_id: userId,
        following_id: targetUserId
      })

      if (error) {
        // Fallback to manual follow
        const { error: insertError } = await supabase
          .from("follows")
          .insert({
            follower_id: userId,
            following_id: targetUserId
          })

        if (insertError) {
          toast({
            title: "Error",
            description: "Failed to follow user",
            variant: "destructive",
          })
          return
        }

        // Update follower counts
        await Promise.all([
          supabase
            .from("profiles")
            .update({ 
              followers_count: supabase.sql`followers_count + 1`
            })
            .eq("id", targetUserId),
          
          supabase
            .from("profiles")
            .update({ 
              following_count: supabase.sql`following_count + 1`
            })
            .eq("id", userId)
        ])
      }

      setFollowingIds(prev => new Set([...prev, targetUserId]))
      
      toast({
        title: "Success",
        description: "Successfully followed user",
      })
    } catch (error) {
      console.error("Error following user:", error)
      toast({
        title: "Error",
        description: "Failed to follow user",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-foreground">Suggested Connections</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3 font-semibold text-foreground">Suggested Connections</h3>
      <div className="space-y-3">
        {suggestions.length > 0 ? (
          suggestions.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Link href={`/profile/${user.id}`}>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/profile/${user.id}`}>
                  <p className="font-medium text-sm truncate hover:text-primary">
                    {user.full_name || "User"}
                  </p>
                </Link>
                <p className="text-xs text-muted-foreground truncate">
                  {user.title || "Official"} • {user.department || "Department"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.followers_count} followers
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleFollow(user.id)}
                disabled={followingIds.has(user.id)}
                className="shrink-0"
              >
                {followingIds.has(user.id) ? (
                  <UserCheck className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-4">
            <UserPlus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No suggestions available
            </p>
            <p className="text-xs text-muted-foreground">
              Check back later for new connections
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}