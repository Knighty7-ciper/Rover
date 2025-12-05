"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import type { Conversation } from "@/lib/types"

interface ConversationListProps {
  conversations: Conversation[]
  currentConversationId?: string
}

export function ConversationList({ conversations, currentConversationId }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">No conversations yet. Start a new message!</div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => {
        const isActive = conversation.id === currentConversationId
        const otherUser = conversation.other_participant
        const initials =
          otherUser?.full_name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase() || "?"

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className={`flex items-center gap-3 p-3 transition-colors hover:bg-muted/50 ${isActive ? "bg-muted" : ""}`}
          >
            <Avatar className="h-12 w-12 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {conversation.is_group ? conversation.name : otherUser?.full_name || "Unknown"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.last_message_at), {
                    addSuffix: false,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="truncate text-sm text-muted-foreground">
                  {conversation.last_message?.content || "No messages yet"}
                </p>
                {(conversation.unread_count ?? 0) > 0 && (
                  <Badge className="ml-2 h-5 min-w-5 justify-center rounded-full px-1.5">
                    {conversation.unread_count}
                  </Badge>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
