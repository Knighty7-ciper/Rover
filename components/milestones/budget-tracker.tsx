"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, TrendingUp, TrendingDown, Plus } from "lucide-react"
import { format } from "date-fns"
import type { Project, BudgetTransaction } from "@/lib/types"

interface BudgetTrackerProps {
  project: Project
  transactions: BudgetTransaction[]
  currentUserId: string
  canEdit: boolean
}

export function BudgetTracker({ project, transactions, currentUserId, canEdit }: BudgetTrackerProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    amount: "",
    transaction_type: "expense",
    description: "",
    transaction_date: new Date().toISOString().split("T")[0],
  })

  const budgetPercentage =
    project.budget_allocated > 0 ? Math.round((project.budget_spent / project.budget_allocated) * 100) : 0

  const remaining = project.budget_allocated - project.budget_spent

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.description) return

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("budget_transactions").insert({
      project_id: project.id,
      amount: Number.parseFloat(formData.amount),
      transaction_type: formData.transaction_type,
      description: formData.description,
      transaction_date: formData.transaction_date,
      recorded_by: currentUserId,
    })

    if (!error) {
      setOpen(false)
      setFormData({
        amount: "",
        transaction_type: "expense",
        description: "",
        transaction_date: new Date().toISOString().split("T")[0],
      })
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Budget Tracker
        </CardTitle>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Record Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Budget Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.transaction_type}
                      onValueChange={(val) => setFormData({ ...formData, transaction_type: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="allocation">Allocation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Contractor payment - Phase 1"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Transaction Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.transaction_date}
                    onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Recording..." : "Record"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Allocated</p>
            <p className="text-lg font-bold text-foreground">KES {project.budget_allocated.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="text-lg font-bold text-primary">KES {project.budget_spent.toLocaleString()}</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className={`text-lg font-bold ${remaining < 0 ? "text-red-600" : "text-green-600"}`}>
              KES {remaining.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Utilization</span>
            <span className={`font-medium ${budgetPercentage > 100 ? "text-red-600" : ""}`}>{budgetPercentage}%</span>
          </div>
          <Progress
            value={Math.min(budgetPercentage, 100)}
            className={`h-3 ${budgetPercentage > 90 ? "[&>div]:bg-red-500" : budgetPercentage > 75 ? "[&>div]:bg-orange-500" : ""}`}
          />
        </div>

        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Recent Transactions</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2">
                    {tx.transaction_type === "expense" ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.transaction_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Badge variant={tx.transaction_type === "expense" ? "destructive" : "default"}>
                    {tx.transaction_type === "expense" ? "-" : "+"}KES {tx.amount.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
