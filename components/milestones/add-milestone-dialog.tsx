"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface AddMilestoneDialogProps {
  projectId: string
  currentOrder: number
}

export function AddMilestoneDialog({ projectId, currentOrder }: AddMilestoneDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("milestones").insert({
      project_id: projectId,
      title: formData.title,
      description: formData.description || null,
      target_date: formData.target_date || null,
      order_index: currentOrder + 1,
      status: "pending",
    })

    if (!error) {
      setOpen(false)
      setFormData({ title: "", description: "", target_date: "" })
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Milestone
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Milestone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Milestone Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Foundation Complete"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Details about this milestone..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_date">Target Date</Label>
            <Input
              id="target_date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.title.trim()}>
              {loading ? "Adding..." : "Add Milestone"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
