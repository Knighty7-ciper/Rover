"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Plus, TrendingUp, AlertCircle, Trophy, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { ProjectUpdate, Milestone } from "@/lib/types"

interface ProjectUpdatesProps {
  projectId: string
  updates: ProjectUpdate[]
  milestones: Milestone[]
  currentUserId: string
  canPost: boolean
}

const updateTypeIcons: Record<string, React.ReactNode> = {
  progress: <TrendingUp className="h-4 w-4 text-blue-500" />,
  blocker: <AlertCircle className="h-4 w-4 text-red-500" />,
  achievement: <Trophy className="h-4 w-4 text-yellow-500" />,
  budget: <MessageSquare className="h-4 w-4 text-green-500" />,
  delay: <Clock className="h-4 w-4 text-orange-500" />,
}

const updateTypeColors: Record<string, string> = {
  progress: "bg-blue-100 text-blue-700",
  blocker: "bg-red-100 text-red-700",
  achievement: "bg-yellow-100 text-yellow-700",
  budget: "bg-green-100 text-green-700",
  delay: "bg-orange-100 text-orange-700",
}

export function ProjectUpdates({ projectId, updates, milestones, currentUserId, canPost }: ProjectUpdatesProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    update_type: "progress",
    milestone_id: null as string | null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("project_updates").insert({
      project_id: projectId,
      author_id: currentUserId,
      title: formData.title,
      content: formData.content,
      update_type: formData.update_type,
      milestone_id: formData.milestone_id,
    })

    if (!error) {
      setOpen(false)
      setFormData({ title: "", content: "", update_type: "progress", milestone_id: null })
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Updates & Reports
        </CardTitle>
        {canPost && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Post Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post Project Update</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Update Type</Label>
                    <Select
                      value={formData.update_type}
                      onValueChange={(val) => setFormData({ ...formData, update_type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="progress">Progress Update</SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="blocker">Blocker</SelectItem>
                        <SelectItem value="delay">Delay</SelectItem>
                        <SelectItem value="budget">Budget Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milestone">Related Milestone</Label>
                    <Select
                      value={formData.milestone_id || "none"}
                      onValueChange={(val) => setFormData({ ...formData, milestone_id: val === "none" ? null : val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Optional" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {milestones.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Phase 1 Construction Complete"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Detailed update..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Posting..." : "Post Update"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No updates yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map((update) => {
              const authorInitials =
                update.author?.full_name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase() || "?"

              return (
                <div key={update.id} className="border-l-2 border-primary/20 pl-4 pb-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-muted">{authorInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{update.author?.full_name}</span>
                        <Badge className={updateTypeColors[update.update_type]} variant="secondary">
                          {updateTypeIcons[update.update_type]}
                          <span className="ml-1">{update.update_type}</span>
                        </Badge>
                        {update.milestone && (
                          <Badge variant="outline" className="text-xs">
                            {update.milestone.title}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium mt-1">{update.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{update.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
