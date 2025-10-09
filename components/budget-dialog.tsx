"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Target } from "lucide-react"
import { categories } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  color: string
}

interface BudgetDialogProps {
  users: User[]
  onBudgetSet: () => void
}

export function BudgetDialog({ users, onBudgetSet }: BudgetDialogProps) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [userId, setUserId] = useState<string | "shared">("shared")
  const [loading, setLoading] = useState(false)

  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !amount) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          amount: parseFloat(amount),
          month: currentMonth,
          userId: userId === "shared" ? null : userId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to set budget')
      }

      // Reset form and close dialog
      setCategory("")
      setAmount("")
      setUserId("shared")
      setOpen(false)
      onBudgetSet()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Target className="h-4 w-4" />
          Set Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Monthly Budget</DialogTitle>
          <DialogDescription>
            Set a budget goal for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-amber-900 font-semibold">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category" className="bg-white border-2 border-amber-300 text-amber-900">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-300 text-amber-900">
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-amber-900 font-semibold">Budget Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="500.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border-2 border-amber-300 text-amber-900"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="user" className="text-amber-900 font-semibold">Apply To</Label>
              <Select value={userId} onValueChange={setUserId} required>
                <SelectTrigger id="user" className="bg-white border-2 border-amber-300 text-amber-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-300 text-amber-900">
                  <SelectItem value="shared">Shared (All Users)</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: user.color }}
                        />
                        {user.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg"
            >
              {loading ? "Setting..." : "Set Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
