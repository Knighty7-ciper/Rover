"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface PrivacySettingsProps {
  userId: string
}

export function PrivacySettings({ userId }: PrivacySettingsProps) {
  const [settings, setSettings] = useState({
    profile_visibility: "public", // public, followers, private
    allow_direct_messages: true,
    allow_mentions: true,
    show_activity_status: false,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsUpdating(true)
    
    try {
      localStorage.setItem(`privacy_settings_${userId}`, JSON.stringify(settings))
      
      toast({
        title: "Success",
        description: "Privacy settings saved",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <TabsContent value="privacy">
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Direct Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Let others send you direct messages
                </p>
              </div>
              <Switch
                checked={settings.allow_direct_messages}
                onCheckedChange={(checked) => updateSetting("allow_direct_messages", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to mention you in posts
                </p>
              </div>
              <Switch
                checked={settings.allow_mentions}
                onCheckedChange={(checked) => updateSetting("allow_mentions", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Activity Status</Label>
                <p className="text-sm text-muted-foreground">
                  Show when you're online
                </p>
              </div>
              <Switch
                checked={settings.show_activity_status}
                onCheckedChange={(checked) => updateSetting("show_activity_status", checked)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={isUpdating}>
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
