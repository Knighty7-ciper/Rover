import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { FeedLayout } from "@/components/feed/feed-layout"
import { ConversationList } from "@/components/messages/conversation-list"
import { NewConversationDialog } from "@/components/messages/new-conversation-dialog"
import { Card } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import type { Profile, Conversation } from "@/lib/types"

export default async function MessagesPage() {
  const supabase = await createClient()

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userData.user.id).single()

  // Fetch conversations with participants
  const { data: participations } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      conversations (
        id,
        name,
        is_group,
        last_message_at,
        created_at
      )
    `)
    .eq("user_id", userData.user.id)
    .order("conversations(last_message_at)", { ascending: false })

  // Get full conversation data with other participants
  const conversations: Conversation[] = []

  if (participations) {
    for (const p of participations) {
      const conv = p.conversations as unknown as Conversation
      if (!conv) continue

      // Get other participants
      const { data: participants } = await supabase
        .from("conversation_participants")
        .select("user_id, profiles(*)")
        .eq("conversation_id", conv.id)
        .neq("user_id", userData.user.id)

      // Get last message
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      // Count unread
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

  // Sort by last message
  conversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())

  return (
    <FeedLayout profile={profile as Profile | null} currentPath="/messages">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <NewConversationDialog currentUserId={userData.user.id} />
      </div>

      <Card className="overflow-hidden">
        {conversations.length > 0 ? (
          <ConversationList conversations={conversations} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-foreground">No conversations yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Start a conversation with a colleague from the directory
            </p>
            <NewConversationDialog currentUserId={userData.user.id} />
          </div>
        )}
      </Card>
    </FeedLayout>
  )
}
