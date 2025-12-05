import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { ConversationList } from "@/components/messages/conversation-list"
import { MessageThread } from "@/components/messages/message-thread"
import { NewConversationDialog } from "@/components/messages/new-conversation-dialog"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Profile, Conversation, Message } from "@/lib/types"

interface ConversationPageProps {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Verify user is participant
  const { data: participation } = await supabase
    .from("conversation_participants")
    .select("*")
    .eq("conversation_id", id)
    .eq("user_id", userData.user.id)
    .single()

  if (!participation) {
    notFound()
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Fetch conversation
  const { data: conversation } = await supabase.from("conversations").select("*").eq("id", id).single()

  if (!conversation) {
    notFound()
  }

  // Get other participant
  const { data: otherParticipant } = await supabase
    .from("conversation_participants")
    .select("profiles(*)")
    .eq("conversation_id", id)
    .neq("user_id", userData.user.id)
    .single()

  // Fetch messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*, profiles(*)")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })

  // Mark messages as read
  await supabase.from("messages").update({ is_read: true }).eq("conversation_id", id).neq("sender_id", userData.user.id)

  // Update last_read_at
  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", id)
    .eq("user_id", userData.user.id)

  // Fetch all conversations for sidebar
  const { data: participations } = await supabase
    .from("conversation_participants")
    .select("conversation_id, conversations(*)")
    .eq("user_id", userData.user.id)

  const conversations: Conversation[] = []
  if (participations) {
    for (const p of participations) {
      const conv = p.conversations as unknown as Conversation
      if (!conv) continue

      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("profiles(*)")
        .eq("conversation_id", conv.id)
        .neq("user_id", userData.user.id)

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("is_read", false)
        .neq("sender_id", userData.user.id)

      conversations.push({
        ...conv,
        other_participant: participants?.[0]?.profiles as Profile | undefined,
        last_message: lastMsg || undefined,
        unread_count: count || 0,
      })
    }
  }

  conversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())

  const otherProfile = otherParticipant?.profiles as Profile | null
  const initials =
    otherProfile?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?"

  return (
    <FeedLayout profile={profile as Profile | null} currentPath="/messages">
      <div className="flex h-[calc(100svh-8rem)] gap-4">
        {/* Conversations Sidebar */}
        <Card className="hidden w-80 shrink-0 overflow-hidden lg:block">
          <div className="flex items-center justify-between border-b border-border p-3">
            <h2 className="font-semibold">Conversations</h2>
            <NewConversationDialog currentUserId={userData.user.id} />
          </div>
          <div className="overflow-y-auto">
            <ConversationList conversations={conversations} currentConversationId={id} />
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="flex flex-1 flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Button variant="ghost" size="icon" className="lg:hidden" asChild>
              <Link href="/messages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{otherProfile?.full_name || "Unknown"}</h3>
              <p className="text-xs text-muted-foreground">
                {otherProfile?.title} · {otherProfile?.department}
              </p>
            </div>
          </div>

          {/* Messages */}
          <MessageThread
            conversationId={id}
            currentUserId={userData.user.id}
            initialMessages={(messages as Message[]) || []}
            otherParticipant={otherProfile}
          />
        </Card>
      </div>
    </FeedLayout>
  )
}
