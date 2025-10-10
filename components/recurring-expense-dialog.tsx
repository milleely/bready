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
import { Repeat } from "lucide-react"
import { categories } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  color: string
}

interface RecurringExpenseDialogProps {
  users: User[]
  onRecurringExpenseAdded: () => void
}

export function RecurringExpenseDialog({ users, onRecurringExpenseAdded }: RecurringExpenseDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [frequency, setFrequency] = useState("monthly")
  const [dayOfMonth, setDayOfMonth] = useState("1")
  const [dayOfWeek, setDayOfWeek] = useState("0")
  const [monthOfYear, setMonthOfYear] = useState("1")
  const [userId, setUserId] = useState("")
  const [isShared, setIsShared] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !category || !description || !userId) {
      alert("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/recurring-expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category,
          description,
          frequency,
          dayOfMonth: frequency === 'monthly' || frequency === 'yearly' ? parseInt(dayOfMonth) : null,
          dayOfWeek: frequency === 'weekly' ? parseInt(dayOfWeek) : null,
          monthOfYear: frequency === 'yearly' ? parseInt(monthOfYear) : null,
          isShared,
          userId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create recurring expense')
      }

      // Reset form and close dialog
      setAmount("")
      setCategory("")
      setDescription("")
      setFrequency("monthly")
      setDayOfMonth("1")
      setDayOfWeek("0")
      setMonthOfYear("1")
      setUserId("")
      setIsShared(false)
      setOpen(false)
      onRecurringExpenseAdded()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold shadow-lg">
          <Repeat className="h-4 w-4" />
          Add Recurring
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Recurring Expense</DialogTitle>
          <DialogDescription>
            Set up an expense that repeats automatically
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-amber-900 font-semibold">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="50.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border-2 border-amber-300 text-amber-900"
                required
              />
            </div>

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
              <Label htmlFor="description" className="text-amber-900 font-semibold">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Netflix subscription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-white border-2 border-amber-300 text-amber-900"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency" className="text-amber-900 font-semibold">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency} required>
                <SelectTrigger id="frequency" className="bg-white border-2 border-amber-300 text-amber-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-300 text-amber-900">
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === 'weekly' && (
              <div className="grid gap-2">
                <Label htmlFor="dayOfWeek" className="text-amber-900 font-semibold">Day of Week</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek} required>
                  <SelectTrigger id="dayOfWeek" className="bg-white border-2 border-amber-300 text-amber-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-amber-300 text-amber-900">
                    <SelectItem value="0">Sunday</SelectItem>
                    <SelectItem value="1">Monday</SelectItem>
                    <SelectItem value="2">Tuesday</SelectItem>
                    <SelectItem value="3">Wednesday</SelectItem>
                    <SelectItem value="4">Thursday</SelectItem>
                    <SelectItem value="5">Friday</SelectItem>
                    <SelectItem value="6">Saturday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {(frequency === 'monthly' || frequency === 'yearly') && (
              <div className="grid gap-2">
                <Label htmlFor="dayOfMonth" className="text-amber-900 font-semibold">Day of Month</Label>
                <Input
                  id="dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  className="bg-white border-2 border-amber-300 text-amber-900"
                  required
                />
              </div>
            )}

            {frequency === 'yearly' && (
              <div className="grid gap-2">
                <Label htmlFor="monthOfYear" className="text-amber-900 font-semibold">Month</Label>
                <Select value={monthOfYear} onValueChange={setMonthOfYear} required>
                  <SelectTrigger id="monthOfYear" className="bg-white border-2 border-amber-300 text-amber-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-amber-300 text-amber-900">
                    <SelectItem value="1">January</SelectItem>
                    <SelectItem value="2">February</SelectItem>
                    <SelectItem value="3">March</SelectItem>
                    <SelectItem value="4">April</SelectItem>
                    <SelectItem value="5">May</SelectItem>
                    <SelectItem value="6">June</SelectItem>
                    <SelectItem value="7">July</SelectItem>
                    <SelectItem value="8">August</SelectItem>
                    <SelectItem value="9">September</SelectItem>
                    <SelectItem value="10">October</SelectItem>
                    <SelectItem value="11">November</SelectItem>
                    <SelectItem value="12">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="user" className="text-amber-900 font-semibold">User</Label>
              <Select value={userId} onValueChange={setUserId} required>
                <SelectTrigger id="user" className="bg-white border-2 border-amber-300 text-amber-900">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-amber-300 text-amber-900">
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

            <div className="flex items-center gap-2">
              <input
                id="isShared"
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <Label htmlFor="isShared" className="text-amber-900 font-semibold cursor-pointer">
                Shared expense (split among all users)
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold shadow-lg"
            >
              {loading ? "Adding..." : "Add Recurring Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
