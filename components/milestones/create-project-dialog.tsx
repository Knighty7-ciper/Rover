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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

interface CreateProjectDialogProps {
  currentUserId: string
  userDepartment: string | null
}

export function CreateProjectDialog({ currentUserId, userDepartment }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: userDepartment || "",
    priority: "medium",
    budget_allocated: "",
    start_date: "",
    target_end_date: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: formData.name,
        description: formData.description || null,
        department: formData.department,
        lead_id: currentUserId,
        priority: formData.priority,
        budget_allocated: formData.budget_allocated ? Number.parseFloat(formData.budget_allocated) : 0,
        start_date: formData.start_date || null,
        target_end_date: formData.target_end_date || null,
        status: "planning",
      })
      .select()
      .single()

    if (!error && data) {
      // Add creator as lead member
      await supabase.from("project_members").insert({
        project_id: data.id,
        user_id: currentUserId,
        role: "lead",
      })

      setOpen(false)
      setFormData({
        name: "",
        description: "",
        department: userDepartment || "",
        priority: "medium",
        budget_allocated: "",
        start_date: "",
        target_end_date: "",
      })
      router.refresh()
      router.push(`/projects/${data.id}`)
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Road Infrastructure Phase 2"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the project..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g., Ministry of Roads"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(val) => setFormData({ ...formData, priority: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget Allocated (KES)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget_allocated}
              onChange={(e) => setFormData({ ...formData, budget_allocated: e.target.value })}
              placeholder="e.g., 50000000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_end_date">Target End Date</Label>
              <Input
                id="target_end_date"
                type="date"
                value={formData.target_end_date}
                onChange={(e) => setFormData({ ...formData, target_end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
