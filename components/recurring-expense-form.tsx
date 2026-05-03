"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { categories } from "@/lib/utils"
import { Repeat, Info } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  color: string
}

interface RecurringExpenseFormProps {
  users: User[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RecurringExpenseForm({ users, open, onOpenChange }: RecurringExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'groceries',
    description: '',
    isShared: false,
    userId: users[0]?.id || '',
  })
  const [loading, setLoading] = useState(false)
  const [dayOfMonth, setDayOfMonth] = useState<number | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate date selection
    if (dayOfMonth === undefined) {
      toast.warning('Please select a day of the month')
      return
    }

    setLoading(true)

    try {
      // Create recurring expense template
      const response = await fetch('/api/recurring-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          frequency: 'monthly',
          dayOfMonth: dayOfMonth,
          isShared: formData.isShared,
          userId: formData.userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create recurring expense')
      }

      // Reset form
      setFormData({
        amount: '',
        category: 'groceries',
        description: '',
        isShared: false,
        userId: users[0]?.id || '',
      })
      setDayOfMonth(undefined)

      // Dispatch event so dashboard can refetch expenses
      window.dispatchEvent(new CustomEvent('expenseAdded'))

      // Close dialog
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to create recurring expense:', error)
      toast.error('Failed to create recurring expense. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-golden-crust-dark">
            <Repeat className="h-5 w-5 text-amber-600" />
            Add Recurring Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount and Category (2-column grid) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-golden-crust-dark font-semibold">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                placeholder="0.00"
                className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-golden-crust-dark font-semibold">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark max-h-[300px]">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{cat.icon}</span>
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-golden-crust-dark font-semibold">
              Description
            </Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="What is this expense for?"
              className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark placeholder:text-golden-crust-dark/60"
            />
          </div>

          {/* User */}
          <div className="space-y-2">
            <Label htmlFor="user" className="text-golden-crust-dark font-semibold">
              User
            </Label>
            <Select
              value={formData.userId}
              onValueChange={(value) => setFormData({ ...formData, userId: value })}
            >
              <SelectTrigger className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: user.color }}
                      />
                      {user.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shared Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="shared"
              checked={formData.isShared}
              onCheckedChange={(checked) => setFormData({ ...formData, isShared: checked === true })}
            />
            <Label htmlFor="shared" className="cursor-pointer text-golden-crust-dark">
              This is a shared expense (split among all users)
            </Label>
          </div>

          {/* Monthly Recurring Date Selector */}
          <div className="p-4 rounded-lg bg-amber-50/50 border-2 border-amber-300/50 space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-golden-crust-dark">
                Monthly Recurring Date
              </Label>
              <Select value={dayOfMonth?.toString() ?? ""} onValueChange={(value) => setDayOfMonth(Number(value))}>
                <SelectTrigger className="w-[180px] bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px] bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day === 1 ? '1st' : day === 2 ? '2nd' : day === 3 ? '3rd' : `${day}th`}
                    </SelectItem>
                  ))}
                  <SelectItem value="-1">Last day of month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-xs text-amber-700 font-medium">
                Recurring expenses will be auto generated each month with 1 month in advanced until cancelled. To edit a recurring expense, delete it and re-create it.
              </AlertDescription>
            </Alert>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 sm:gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border border-golden-crust-medium text-golden-crust-dark hover:bg-amber-100 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="toast-gradient-golden hover:toast-gradient-dark text-white font-semibold shadow-lg"
            >
              {loading ? 'Creating...' : 'Create Recurring Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
