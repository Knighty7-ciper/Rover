"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface SearchSuggestion {
  type: "profile" | "tag" | "project"
  id: string
  title: string
  subtitle: string
  avatar?: string
  url: string
}

interface SearchInputProps {
  placeholder?: string
  onSearch?: (query: string) => void
  className?: string
  showSuggestions?: boolean
}

export function SearchInput({ 
  placeholder = "Search people, posts, projects...",
  onSearch,
  className,
  showSuggestions = true 
}: SearchInputProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounced search suggestions
  useEffect(() => {
    if (!query.trim() || !showSuggestions) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}&limit=5`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
          setShowDropdown(data.suggestions?.length > 0)
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, showSuggestions])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          router.push(suggestions[selectedIndex].url)
          setShowDropdown(false)
          setQuery("")
        } else if (query.trim()) {
          handleSearch(query)
        }
        break
      case "Escape":
        setShowDropdown(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return
    
    onSearch?.(searchQuery)
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setShowDropdown(false)
    setSelectedIndex(-1)
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
    setShowDropdown(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current && 
      !dropdownRef.current.contains(e.target as Node) &&
      inputRef.current && 
      !inputRef.current.contains(e.target as Node)
    ) {
      setShowDropdown(false)
      setSelectedIndex(-1)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "profile":
        return "👤"
      case "tag":
        return "#"
      case "project":
        return "📁"
      default:
        return "🔍"
    }
  }

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowDropdown(true)
            }
          }}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-auto shadow-lg"
        >
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <Link
                key={`${suggestion.type}-${suggestion.id}`}
                href={suggestion.url}
                className={cn(
                  "flex items-center gap-3 rounded-md p-2 text-sm hover:bg-muted transition-colors",
                  index === selectedIndex && "bg-muted"
                )}
                onClick={() => {
                  setShowDropdown(false)
                  setQuery("")
                }}
              >
                {suggestion.type === "profile" ? (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={suggestion.avatar} />
                    <AvatarFallback className="text-xs">
                      {suggestion.title.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center text-xs font-medium text-muted-foreground">
                    {getTypeIcon(suggestion.type)}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {suggestion.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {suggestion.subtitle}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground capitalize">
                  {suggestion.type}
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
