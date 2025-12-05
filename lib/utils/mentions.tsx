import type React from "react"
// Parse @mentions and #tags from content
export function parseContent(content: string) {
  const mentionRegex = /@(\w+)/g
  const tagRegex = /#(\w+)/g

  const mentions: string[] = []
  const tags: string[] = []

  let match
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1])
  }
  while ((match = tagRegex.exec(content)) !== null) {
    tags.push(match[1].toLowerCase())
  }

  return { mentions, tags }
}

// Render content with clickable mentions and tags
export function renderContent(content: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  const regex = /(@\w+|#\w+)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith("@")) {
      parts.push(`<mention>${token}</mention>`)
    } else if (token.startsWith("#")) {
      parts.push(`<tag>${token}</tag>`)
    }

    lastIndex = match.index + token.length
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts
}
