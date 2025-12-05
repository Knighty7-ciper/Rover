"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { 
  Heart, 
  MessageSquare, 
  AtSign, 
  UserPlus, 
  Mail,
  BarChart3,
  CheckCircle2,
  MoreHorizontal,
  Bell
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import type { Notification } from "@/lib/types"

interface NotificationListProps {
  notifications: (Notification & { actor?: any })[]
  userId: string
}

export function NotificationList({ notifications, userId }: NotificationListProps) {
  const [notificationState, setNotificationState] = useState(notifications)
  const supabase = createClient()
  const { toast } = useToast()

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      case "mention":
        return <AtSign className="h-4 w-4 text-purple-500" />
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />
      case "message":
        return <Mail className="h-4 w-4 text-blue-500" />
      case "project_update":
        return <BarChart3 className="h-4 w-4 text-orange-500" />
      case "milestone_complete":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationLink = (notification: Notification) => {
    if (notification.entity_type === "post") {
      return `/post/${notification.entity_id}`
    }
    if (notification.entity_type === "profile") {
      return `/profile/${notification.entity_id}`
    }
    return "#"
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId)

      if (!error) {
        setNotificationState(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, is_read: true }
              : n
          )
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  if (notificationState.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
        <p className="text-muted-foreground">
          When you get mentions, comments, or other updates, they'll appear here.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {notificationState.map((notification) => (
        <Card 
          key={notification.id} 
          className={`p-4 hover:bg-muted/50 transition-colors ${
            !notification.is_read ? "bg-muted/20 border-primary/20" : ""
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {notification.actor ? (
                <Link href={`/profile/${notification.actor.id}`}>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={notification.actor.avatar_url || ""} />
                    <AvatarFallback>
                      {notification.actor.full_name
                        ?.split(" ")
                        .map(n => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  {getNotificationIcon(notification.type)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-6 w-6 p-0"
                    >
                      <span className="sr-only">Mark as read</span>
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}