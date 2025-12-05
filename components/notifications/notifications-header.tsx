"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bell } from "lucide-react"
import { useState } from "react"

interface NotificationsHeaderProps {
  unreadCount: number
  userId: string
}

export function NotificationsHeader({ unreadCount, userId }: NotificationsHeaderProps) {
  const [isMarking, setIsMarking] = useState(false)

  const markAllAsRead = async () => {
    try {
      setIsMarking(true)
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Refresh the page to show updated notifications
        window.location.reload()
      } else {
        console.error("Failed to mark notifications as read")
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    } finally {
      setIsMarking(false)
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
      
      {unreadCount > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={markAllAsRead}
          disabled={isMarking}
        >
          {isMarking ? "Marking..." : "Mark all as read"}
        </Button>
      )}
    </div>
  )
}
