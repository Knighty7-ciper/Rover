"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import type { Profile } from "@/lib/types"

interface NewConversationDialogProps {
  currentUserId: string
}

export function NewConversationDialog({ currentUserId }: NewConversationDialogProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const searchUsers = async () => {
      if (!search.trim()) {
        setUsers([])
        return
      }

      const supabase = createClient()
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", currentUserId)
        .ilike("full_name", `%${search}%`)
        .limit(10)

      setUsers(data || [])
    }

    const debounce = setTimeout(searchUsers, 300)
    return () => clearTimeout(debounce)
  }, [search, currentUserId])

  const startConversation = async (userId: string) => {
    setIsLoading(true)
    const supabase = createClient()

    // Check if conversation already exists
    const { data: existingConvos } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", currentUserId)

    if (existingConvos && existingConvos.length > 0) {
      const convoIds = existingConvos.map((c) => c.conversation_id)

      const { data: sharedConvo } = await supabase
        .from("conversation_participants")
        .select("conversation_id, conversations!inner(is_group)")
        .eq("user_id", userId)
        .in("conversation_id", convoIds)
        .eq("conversations.is_group", false)
        .limit(1)
        .single()

      if (sharedConvo) {
        setOpen(false)
        router.push(`/messages/${sharedConvo.conversation_id}`)
        setIsLoading(false)
        return
      }
    }

    // Create new conversation
    const { data: newConvo, error: convoError } = await supabase
      .from("conversations")
      .insert({
        created_by: currentUserId,
        is_group: false,
      })
      .select()
      .single()

    if (convoError || !newConvo) {
      setIsLoading(false)
      return
    }

    // Add participants
    await supabase.from("conversation_participants").insert([
      { conversation_id: newConvo.id, user_id: currentUserId },
      { conversation_id: newConvo.id, user_id: userId },
    ])

    setOpen(false)
    router.push(`/messages/${newConvo.id}`)
    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Message
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
          <DialogDescription>Search for a colleague to start a conversation</DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {users.length === 0 && search && (
            <p className="py-4 text-center text-sm text-muted-foreground">No users found</p>
          )}
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => startConversation(user.id)}
              disabled={isLoading}
              className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.full_name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  {user.title} · {user.department}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
