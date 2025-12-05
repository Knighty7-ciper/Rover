"use client"

import { useState, useEffect } from "react"
import { Search, User, FileText, FolderOpen, Hash, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface SearchResultsProps {
  query: string
  initialResults?: any
  className?: string
}

interface SearchResult {
  people?: any[]
  posts?: any[]
  projects?: any[]
  tags?: any[]
  global?: any[]
}

export function SearchResults({ query, initialResults, className }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult>(initialResults || {})
  const [loading, setLoading] = useState(!initialResults)
  const [activeTab, setActiveTab] = useState("all")
  const [hasSearched, setHasSearched] = useState(!!initialResults)

  useEffect(() => {
    if (!initialResults && query) {
      performSearch()
    }
  }, [query])

  const performSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setHasSearched(true)
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=all`)
      if (response.ok) {
        const data = await response.json()
        setResults(data.results || {})
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalResults = () => {
    return Object.values(results).reduce((total, category) => {
      return total + (Array.isArray(category) ? category.length : 0)
    }, 0)
  }

  const getResultCount = (type: string) => {
    return results[type as keyof SearchResult]?.length || 0
  }

  if (!hasSearched) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Search ROVER</h3>
        <p className="text-muted-foreground">
          Find people, posts, projects, and more across the platform.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Searching...</p>
      </div>
    )
  }

  const totalResults = getTotalResults()

  if (totalResults === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-muted-foreground">
          No results found for "{query}". Try different keywords or check your spelling.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => performSearch()}
        >
          Search Again
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          Search Results for "{query}"
        </h2>
        <p className="text-muted-foreground">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all" className="flex items-center gap-2">
            All
            {totalResults > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 text-xs">
                {totalResults}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="people" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            People
            {getResultCount("people") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 text-xs">
                {getResultCount("people")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Posts
            {getResultCount("posts") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 text-xs">
                {getResultCount("posts")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4" />
            Projects
            {getResultCount("projects") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 text-xs">
                {getResultCount("projects")}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            Tags
            {getResultCount("tags") > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 text-xs">
                {getResultCount("tags")}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="all" className="mt-0">
            <div className="space-y-6">
              {/* Global results */}
              {results.global && results.global.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold mb-4">All Results</h3>
                  <div className="space-y-3">
                    {results.global.map((item: any) => (
                      <GlobalResultCard key={item.entity_id} result={item} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </TabsContent>

          <TabsContent value="people" className="mt-0">
            <div className="grid gap-4">
              {results.people?.map((person: any) => (
                <PersonCard key={person.id} person={person} />
              )) || (
                <p className="text-muted-foreground">No people found.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="posts" className="mt-0">
            <div className="space-y-4">
              {results.posts?.map((post: any) => (
                <PostCard key={post.id} post={post} />
              )) || (
                <p className="text-muted-foreground">No posts found.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-0">
            <div className="grid gap-4">
              {results.projects?.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              )) || (
                <p className="text-muted-foreground">No projects found.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="tags" className="mt-0">
            <div className="grid gap-4">
              {results.tags?.map((tag: any) => (
                <TagCard key={tag.id} tag={tag} />
              )) || (
                <p className="text-muted-foreground">No tags found.</p>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

// Helper components for different result types
function GlobalResultCard({ result }: { result: any }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "profile":
        return <User className="h-4 w-4" />
      case "post":
        return <FileText className="h-4 w-4" />
      case "project":
        return <FolderOpen className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeUrl = (type: string, id: string) => {
    switch (type) {
      case "profile":
        return `/profile/${id}`
      case "post":
        return `/post/${id}`
      case "project":
        return `/projects/${id}`
      default:
        return "#"
    }
  }

  return (
    <Link href={getTypeUrl(result.entity_type, result.entity_id)}>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {getTypeIcon(result.entity_type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold truncate">{result.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {result.entity_type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {result.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

function PersonCard({ person }: { person: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={person.avatar_url} />
            <AvatarFallback>
              {person.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{person.full_name}</h3>
            <p className="text-sm text-muted-foreground">
              {person.title && `${person.title} • `}{person.department}
            </p>
            <p className="text-xs text-muted-foreground">
              {person.followers_count} followers
            </p>
          </div>
          <Link href={`/profile/${person.id}`}>
            <Button variant="outline" size="sm">View Profile</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function PostCard({ post }: { post: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {post.profiles && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.profiles.avatar_url} />
              <AvatarFallback>
                {post.profiles.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium">{post.profiles?.full_name}</h4>
              <Badge variant="outline" className="text-xs">{post.content_type}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {post.content}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectCard({ project }: { project: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{project.name}</h3>
              <Badge variant={project.status === "completed" ? "default" : "secondary"}>
                {project.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{project.department}</span>
              <span>{project.progress_percentage}% complete</span>
            </div>
          </div>
          <Link href={`/projects/${project.id}`}>
            <Button variant="outline" size="sm">View Project</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function TagCard({ tag }: { tag: any }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">#{tag.name}</h3>
              <p className="text-sm text-muted-foreground">
                {tag.posts_count} post{tag.posts_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Link href={`/tag/${tag.name}`}>
            <Button variant="outline" size="sm">View Posts</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}