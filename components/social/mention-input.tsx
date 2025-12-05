"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Profile } from "@/lib/types"

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function MentionInput({ value, onChange, placeholder, className }: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm) {
        setSuggestions([])
        return
      }

      const supabase = createClient()
      const { data } = await supabase.from("profiles").select("*").ilike("full_name", `%${searchTerm}%`).limit(5)

      setSuggestions(data || [])
    }

    const debounce = setTimeout(fetchSuggestions, 200)
    return () => clearTimeout(debounce)
  }, [searchTerm])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const position = e.target.selectionStart || 0
    setCursorPosition(position)
    onChange(newValue)

    // Check if we're typing a mention
    const textBeforeCursor = newValue.slice(0, position)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setSearchTerm(mentionMatch[1])
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setSearchTerm("")
    }
  }

  const insertMention = (profile: Profile) => {
    const textBeforeCursor = value.slice(0, cursorPosition)
    const textAfterCursor = value.slice(cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      const newTextBefore = textBeforeCursor.slice(0, -mentionMatch[0].length)
      const mentionText = `@${profile.full_name?.replace(/\s+/g, "_")} `
      const newValue = newTextBefore + mentionText + textAfterCursor
      onChange(newValue)
    }

    setShowSuggestions(false)
    setSearchTerm("")
    textareaRef.current?.focus()
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-card shadow-lg">
          {suggestions.map((profile) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => insertMention(profile)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {profile.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">{profile.department}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
