"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Hash } from "lucide-react"
import Link from "next/link"

interface TrendingTopicsProps {
  userId: string
}

interface TrendingTag {
  id: string
  name: string
  posts_count: number
  created_at: string
}

export function TrendingTopics({ userId }: TrendingTopicsProps) {
  const [tags, setTags] = useState<TrendingTag[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTrendingTags()
  }, [])

  const fetchTrendingTags = async () => {
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .rpc('get_trending_tags', { limit_count: 5 })

      if (error) {
        console.error("Error fetching trending tags:", error)
        // Fallback to empty array if function doesn't exist yet
        setTags([])
      } else {
        setTags(data || [])
      }
    } catch (error) {
      console.error("Error fetching trending tags:", error)
      setTags([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fallback component while loading or if no tags
  if (isLoading) {
    return (
      <Card className="p-4">
        <h3 className="mb-3 font-semibold text-foreground">Trending Topics</h3>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3 font-semibold text-foreground">Trending Topics</h3>
      <div className="space-y-3">
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Link key={tag.id} href={`/tag/${tag.name}`}>
              <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <Hash className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium text-primary">#{tag.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tag.posts_count} {tag.posts_count === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          // Fallback when no tags exist yet
          <div className="text-center py-4">
            <Hash className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No trending topics yet
            </p>
            <p className="text-xs text-muted-foreground">
              Start using #tags in your posts
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
