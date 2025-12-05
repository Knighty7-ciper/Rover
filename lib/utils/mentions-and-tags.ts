/**
 * Utilities for parsing and handling mentions and tags in posts
 */

export function parseMentions(text: string): string[] {
  // Match @username patterns (alphanumeric and underscores)
  const mentionRegex = /@([a-zA-Z0-9_]+)/g
  const mentions = []
  let match
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1])
  }
  
  return [...new Set(mentions)] // Remove duplicates
}

export function parseTags(text: string): string[] {
  // Match #tag patterns (alphanumeric and underscores)
  const tagRegex = /#([a-zA-Z0-9_]+)/g
  const tags = []
  let match
  
  while ((match = tagRegex.exec(text)) !== null) {
    tags.push(match[1].toLowerCase()) // Normalize to lowercase
  }
  
  return [...new Set(tags)] // Remove duplicates
}

export function highlightMentions(text: string): string {
  // Replace @mentions with clickable links
  return text.replace(
    /@([a-zA-Z0-9_]+)/g,
    '<a href="/profile/$1" class="text-primary hover:underline">@$1</a>'
  )
}

export function highlightTags(text: string): string {
  // Replace #tags with clickable links
  return text.replace(
    /#([a-zA-Z0-9_]+)/g,
    '<a href="/tag/$1" class="text-primary hover:underline">#$1</a>'
  )
}

export function renderContent(text: string): string {
  // Render both mentions and tags
  let processed = text
  processed = highlightTags(processed)
  processed = highlightMentions(processed)
  return processed
}

export function getDisplayNameFromUsername(username: string, profiles: any[]): string {
  // Try to find profile by username or email
  const profile = profiles.find(p => 
    p.email?.toLowerCase().includes(username.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(username.toLowerCase())
  )
  
  return profile?.full_name || username
}

export function isValidUsername(username: string): boolean {
  // Check if username follows pattern @[alphanumeric_and_underscores]
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  return usernameRegex.test(username) && username.length >= 1 && username.length <= 50
}

export function isValidTag(tag: string): boolean {
  // Check if tag follows pattern #[alphanumeric_and_underscores]
  const tagRegex = /^[a-zA-Z0-9_]+$/
  return tagRegex.test(tag) && tag.length >= 1 && tag.length <= 50
}
