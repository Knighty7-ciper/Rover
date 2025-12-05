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
    const type = searchParams.get("type") || "all" // people, posts, projects, tags, all
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (!query.trim()) {
      return NextResponse.json({ results: {} })
    }

    const results: any = {}

    // Search profiles (people)
    if (type === "all" || type === "people") {
      const { data: profiles, error: profilesError } = await supabase
        .rpc("search_profiles", {
          search_term: query,
          limit_count: limit
        })

      if (profilesError) {
        console.error("Error searching profiles:", profilesError)
      } else {
        results.people = profiles || []
      }
    }

    // Search posts
    if (type === "all" || type === "posts") {
      const { data: posts, error: postsError } = await supabase
        .rpc("search_posts", {
          search_term: query,
          limit_count: limit
        })

      if (postsError) {
        console.error("Error searching posts:", postsError)
      } else {
        results.posts = posts || []
      }
    }

    // Search projects
    if (type === "all" || type === "projects") {
      const { data: projects, error: projectsError } = await supabase
        .rpc("search_projects", {
          search_term: query,
          limit_count: limit
        })

      if (projectsError) {
        console.error("Error searching projects:", projectsError)
      } else {
        results.projects = projects || []
      }
    }

    // Search tags
    if (type === "all" || type === "tags") {
      const { data: tags, error: tagsError } = await supabase
        .rpc("search_tags", {
          search_term: query,
          limit_count: limit
        })

      if (tagsError) {
        console.error("Error searching tags:", tagsError)
      } else {
        results.tags = tags || []
      }
    }

    // Global search
    if (type === "all") {
      const { data: globalResults, error: globalError } = await supabase
        .rpc("global_search", {
          search_term: query,
          user_id: user.id,
          limit_count: limit * 4 // More results for global search
        })

      if (globalError) {
        console.error("Error in global search:", globalError)
      } else {
        results.global = globalResults || []
      }
    }

    return NextResponse.json({ 
      query,
      type,
      results,
      pagination: {
        limit,
        offset,
        hasMore: results[type]?.length === limit
      }
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}