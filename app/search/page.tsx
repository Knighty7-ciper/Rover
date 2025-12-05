import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { SearchResults } from "@/components/search/search-results"
import { SearchInput } from "@/components/search/search-input"

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const query = searchParams.q || ""

  // Get initial results if there's a query
  let initialResults = null
  if (query) {
    try {
      // This would normally be done client-side, but we can pre-load for better UX
      const { data: profiles } = await supabase
        .rpc("search_profiles", { search_term: query, limit_count: 10 })

      const { data: posts } = await supabase
        .rpc("search_posts", { search_term: query, limit_count: 10 })

      const { data: projects } = await supabase
        .rpc("search_projects", { search_term: query, limit_count: 10 })

      const { data: tags } = await supabase
        .rpc("search_tags", { search_term: query, limit_count: 10 })

      initialResults = {
        people: profiles || [],
        posts: posts || [],
        projects: projects || [],
        tags: tags || []
      }
    } catch (error) {
      console.error("Error preloading search results:", error)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search ROVER</h1>
        <div className="max-w-2xl">
          <SearchInput 
            placeholder="Search people, posts, projects, tags..."
            className="w-full"
          />
        </div>
      </div>

      {/* Search Results */}
      <SearchResults 
        query={query}
        initialResults={initialResults}
      />
    </div>
  )
}
