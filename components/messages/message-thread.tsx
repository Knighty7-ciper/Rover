"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { format, isToday, isYesterday } from "date-fns"
import { useRouter } from "next/navigation"
import type { Message, Profile } from "@/lib/types"

interface MessageThreadProps {
  conversationId: string
  currentUserId: string
  initialMessages: Message[]
  otherParticipant: Profile | null
}

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
  otherParticipant,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Real-time subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // Fetch the full message with profile
          const { data } = await supabase.from("messages").select("*, profiles(*)").eq("id", payload.new.id).single()

          if (data) {
            setMessages((prev) => [...prev, data as Message])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  const handleSend = async () => {
    if (!newMessage.trim()) return
    setIsSending(true)

    const supabase = createClient()

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: newMessage.trim(),
      })
      .select("*, profiles(*)")
      .single()

    if (!error && data) {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === data.id)
        return exists ? prev : [...prev, data as Message]
      })
      setNewMessage("")
    }

    setIsSending(false)
    router.refresh()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return format(date, "h:mm a")
    if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`
    return format(date, "MMM d, h:mm a")
  }

  const groupMessagesByDate = () => {
    const groups: { date: string; messages: Message[] }[] = []
    let currentDate = ""

    messages.forEach((message) => {
      const msgDate = format(new Date(message.created_at), "yyyy-MM-dd")
      if (msgDate !== currentDate) {
        currentDate = msgDate
        groups.push({ date: msgDate, messages: [message] })
      } else {
        groups[groups.length - 1].messages.push(message)
      }
    })

    return groups
  }

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    if (isToday(date)) return "Today"
    if (isYesterday(date)) return "Yesterday"
    return format(date, "MMMM d, yyyy")
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">No messages yet. Say hello to {otherParticipant?.full_name}!</p>
          </div>
        ) : (
          groupMessagesByDate().map((group) => (
            <div key={group.date}>
              {/* Date Header */}
              <div className="my-4 flex items-center gap-4">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">{formatDateHeader(group.date)}</span>
                <div className="flex-1 border-t border-border" />
              </div>

              {/* Messages */}
              {group.messages.map((message) => {
                const isOwn = message.sender_id === currentUserId
                const senderInitials =
                  message.profiles?.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"

                return (
                  <div key={message.id} className={`mb-4 flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                    {!isOwn && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-muted text-xs">{senderInitials}</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`mt-1 text-xs ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {formatMessageDate(message.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
