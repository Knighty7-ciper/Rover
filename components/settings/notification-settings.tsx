"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationSettingsProps {
  userId: string
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    mentions: true,
    comments: true,
    likes: true,
    follows: true,
    messages: true,
    project_updates: true,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    // Load notification preferences from localStorage or database
    // For now, using defaults
  }, [])

  const handleSave = async () => {
    setIsUpdating(true)
    
    try {
      // Save to user preferences (you might want to create a user_preferences table)
      localStorage.setItem(`notification_settings_${userId}`, JSON.stringify(settings))
      
      toast({
        title: "Success",
        description: "Notification preferences saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <TabsContent value="notifications">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting("email_notifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                checked={settings.push_notifications}
                onCheckedChange={(checked) => updateSetting("push_notifications", checked)}
              />
            </div>

            <hr />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">When should we notify you?</h4>
              
              <div className="flex items-center justify-between">
                <Label>Mentions</Label>
                <Switch
                  checked={settings.mentions}
                  onCheckedChange={(checked) => updateSetting("mentions", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Comments</Label>
                <Switch
                  checked={settings.comments}
                  onCheckedChange={(checked) => updateSetting("comments", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Likes</Label>
                <Switch
                  checked={settings.likes}
                  onCheckedChange={(checked) => updateSetting("likes", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>New Followers</Label>
                <Switch
                  checked={settings.follows}
                  onCheckedChange={(checked) => updateSetting("follows", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Messages</Label>
                <Switch
                  checked={settings.messages}
                  onCheckedChange={(checked) => updateSetting("messages", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Project Updates</Label>
                <Switch
                  checked={settings.project_updates}
                  onCheckedChange={(checked) => updateSetting("project_updates", checked)}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isUpdating}>
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Saving..." : "Save Preferences"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}