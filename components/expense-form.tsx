"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { categories } from "@/lib/utils"
import { Plus } from "lucide-react"

interface User {
  id: string
  name: string
  color: string
}

interface Expense {
  id?: string
  amount: number
  category: string
  description: string
  date: Date | string
  isShared: boolean
  userId: string
}

interface ExpenseFormProps {
  users: User[]
  expense?: Expense
  onSubmit: (expense: Omit<Expense, 'id'>) => Promise<void>
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExpenseForm({ users, expense, onSubmit, trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: ExpenseFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState({
    amount: expense?.amount?.toString() || '',
    category: expense?.category || 'groceries',
    description: expense?.description || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isShared: expense?.isShared || false,
    userId: expense?.userId || users[0]?.id || '',
  })
  const [loading, setLoading] = useState(false)

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        category: expense.category,
        description: expense.description,
        date: new Date(expense.date).toISOString().split('T')[0],
        isShared: expense.isShared,
        userId: expense.userId,
      })
      // Auto-open dialog when editing
      setOpen(true)
    }
  }, [expense])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await onSubmit({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
        isShared: formData.isShared,
        userId: formData.userId,
      })

      if (!expense) {
        setFormData({
          amount: '',
          category: 'groceries',
          description: '',
          date: new Date().toISOString().split('T')[0],
          isShared: false,
          userId: users[0]?.id || '',
        })
      }

      setOpen(false)
    } catch (error) {
      console.error('Failed to submit expense:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-golden-crust-dark font-semibold">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-golden-crust-dark font-semibold">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-golden-crust-dark font-semibold">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-golden-crust-dark font-semibold">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark placeholder:text-golden-crust-dark/60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user" className="text-golden-crust-dark font-semibold">User</Label>
            <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
              <SelectTrigger className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.color }} />
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="shared"
              type="checkbox"
              checked={formData.isShared}
              onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
              className="rounded border-golden-crust-medium"
            />
            <Label htmlFor="shared" className="cursor-pointer text-golden-crust-dark">
              This is a shared expense (split among all users)
            </Label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border border-golden-crust-medium text-golden-crust-dark hover:bg-amber-100 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
            >
              {loading ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
