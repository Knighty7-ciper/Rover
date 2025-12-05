import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const limit = parseInt(searchParams.get("limit") || "5")

    if (!query.trim()) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = []

    // Get profile suggestions
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, title, department, avatar_url")
      .or(`full_name.ilike.%${query}%,title.ilike.%${query}%,department.ilike.%${query}%`)
      .neq("id", user.id)
      .order("followers_count", { ascending: false })
      .limit(limit)

    if (profiles) {
      profiles.forEach(profile => {
        suggestions.push({
          type: "profile",
          id: profile.id,
          title: profile.full_name,
          subtitle: `${profile.title || ''} ${profile.department ? '• ' + profile.department : ''}`,
          avatar: profile.avatar_url,
          url: `/profile/${profile.id}`
        })
      })
    }

    // Get tag suggestions
    const { data: tags } = await supabase
      .from("tags")
      .select("id, name, posts_count")
      .ilike("name", `%${query}%`)
      .order("posts_count", { ascending: false })
      .limit(limit)

    if (tags) {
      tags.forEach(tag => {
        suggestions.push({
          type: "tag",
          id: tag.id,
          title: `#${tag.name}`,
          subtitle: `${tag.posts_count} posts`,
          url: `/tag/${tag.name}`
        })
      })
    }

    // Get project suggestions
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name, department, status")
      .or(`name.ilike.%${query}%,department.ilike.%${query}%`)
      .order("progress_percentage", { ascending: false })
      .limit(limit)

    if (projects) {
      projects.forEach(project => {
        suggestions.push({
          type: "project",
          id: project.id,
          title: project.name,
          subtitle: `${project.department} • ${project.status}`,
          url: `/projects/${project.id}`
        })
      })
    }

    // Sort suggestions by relevance (profiles first, then tags, then projects)
    const sortedSuggestions = suggestions.sort((a, b) => {
      const typeOrder = { profile: 1, tag: 2, project: 3 }
      return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder]
    })

    return NextResponse.json({ 
      suggestions: sortedSuggestions.slice(0, limit)
    })
  } catch (error) {
    console.error("Search suggestions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}