"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { categories } from "@/lib/utils"
import { Plus, Repeat } from "lucide-react"
import { toast } from "sonner"

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
  recurringExpenseId?: string | null
}

interface ExpenseFormProps {
  users: User[]
  expense?: Expense
  onSubmit: (expense: Omit<Expense, 'id'>) => Promise<void>
  /**
   * Optional: enables the "Save & add another" button.
   * When provided, ExpenseForm renders a third button next to Cancel/Save that
   * persists the expense, keeps the dialog open, resets only amount and
   * description (category, date, user, and isShared stay sticky), and focuses
   * the amount input for the next entry. Caller MUST NOT close the dialog
   * from inside this callback.
   */
  onSaveAndAddAnother?: (expense: Omit<Expense, 'id'>) => Promise<void>
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExpenseForm({ users, expense, onSubmit, onSaveAndAddAnother, trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: ExpenseFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState({
    amount: expense?.amount?.toString() || '',
    category: expense?.category || 'groceries',
    description: expense?.description || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : (() => {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    })(),
    isShared: expense?.isShared || false,
    userId: expense?.userId || users[0]?.id || '',
  })
  const [loading, setLoading] = useState(false)
  const [addedCount, setAddedCount] = useState(0)
  const [categoryUsage, setCategoryUsage] = useState<Record<string, number>>({})
  const amountInputRef = useRef<HTMLInputElement>(null)

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen

  // Reset session-counter when the dialog closes so each open starts at 0.
  useEffect(() => {
    if (!open) {
      setAddedCount(0)
    }
  }, [open])

  // Adaptive ordering: pull this household's category usage each time the dialog
  // opens, so the categories you use most float to the top of the picker. Counts
  // come straight from the DB, so it keeps learning as you add more expenses.
  useEffect(() => {
    if (!open) return
    fetch('/api/categories/usage')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setCategoryUsage(data))
      .catch(() => setCategoryUsage({}))
  }, [open])

  // Sort by usage (desc), keeping "Other" pinned last. Array.sort is stable, so
  // ties — and the initial state before usage loads — keep the default order.
  const orderedCategories = useMemo(() => {
    return [...categories].sort((a, b) => {
      if (a.value === 'other') return 1
      if (b.value === 'other') return -1
      return (categoryUsage[b.value] ?? 0) - (categoryUsage[a.value] ?? 0)
    })
  }, [categoryUsage])

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

  /**
   * Core submit pipeline shared by Save and "Save & add another".
   *
   *   mode === 'save'         → submit + close dialog + full reset (existing behavior)
   *   mode === 'add-another'  → submit + KEEP dialog open + partial reset (date/user/isShared stay)
   *                             + increment session counter + focus the amount input
   */
  const processSubmit = async (mode: 'save' | 'add-another') => {
    // Defensive validation: Ensure userId is set
    if (!formData.userId) {
      toast.warning('Please wait for users to load, then try again. If the problem persists, refresh the page.')
      return
    }

    setLoading(true)

    try {
      const expensePayload = {
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
        isShared: formData.isShared,
        userId: formData.userId,
      }

      // Route to the appropriate caller hook based on submit mode
      if (mode === 'add-another' && onSaveAndAddAnother) {
        await onSaveAndAddAnother(expensePayload)
      } else {
        await onSubmit(expensePayload)
      }

      // SUCCESS branch
      if (mode === 'add-another') {
        // Partial reset: clear what typically changes per expense, keep what doesn't.
        setFormData(prev => ({
          ...prev,
          amount: '',
          description: '',
          // category, date, userId, isShared remain sticky for fast batch entry
        }))

        const nextCount = addedCount + 1
        setAddedCount(nextCount)
        toast.success(`Expense added — ${nextCount} this session`)

        // Focus the amount input on the next tick so the user can immediately type
        setTimeout(() => amountInputRef.current?.focus(), 50)
      } else {
        // Existing behavior: full reset on add, then close
        if (!expense) {
          setFormData({
            amount: '',
            category: 'groceries',
            description: '',
            date: (() => {
              const now = new Date()
              const year = now.getFullYear()
              const month = String(now.getMonth() + 1).padStart(2, '0')
              const day = String(now.getDate()).padStart(2, '0')
              return `${year}-${month}-${day}`
            })(),
            isShared: false,
            userId: users[0]?.id || '',
          })
        }
        setOpen(false)
      }
    } catch (error) {
      console.error('Failed to submit expense:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit expense. Please try again.'
      toast.error(errorMessage)
      // Don't close the form on error - let user retry
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await processSubmit('save')
  }

  const handleSaveAndAddAnother = async () => {
    // Manually check HTML5 validity since this isn't a true submit
    const form = amountInputRef.current?.form
    if (form && !form.checkValidity()) {
      form.reportValidity()
      return
    }
    await processSubmit('add-another')
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
          <DialogTitle className="flex items-center gap-2 text-xl text-stone-900 dark:text-stone-100">
            {expense ? (
              <>Edit Expense</>
            ) : (
              <>
                <Plus className="h-5 w-5 text-amber-600" />
                Add New Expense
                {addedCount > 0 && (
                  <span className="ml-auto text-sm font-normal tabular-nums text-stone-500 dark:text-stone-400">
                    {addedCount} added this session
                  </span>
                )}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Show warning if no users are loaded yet */}
        {users.length === 0 && (
          <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 mt-4">
            <AlertDescription className="text-sm text-amber-900">
              ⚠️ Loading your household users... Please wait a moment before submitting.
            </AlertDescription>
          </Alert>
        )}

        {/* Show alert when editing a recurring expense */}
        {expense?.recurringExpenseId && (
          <Alert className="bg-purple-50 border-purple-200 mt-4">
            <Repeat className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-sm">
              This is a recurring expense.
              <Button
                type="button"
                variant="link"
                onClick={async () => {
                  if (!confirm("Stop this expense from recurring? This will only affect this specific expense.")) return

                  try {
                    const response = await fetch(`/api/expenses/${expense.id}/unmark-recurring`, {
                      method: 'POST'
                    })

                    if (!response.ok) {
                      throw new Error('Failed to unmark recurring')
                    }

                    toast.success('Expense unmarked as recurring')
                    setOpen(false)
                    // Dispatch event to refresh parent
                    window.dispatchEvent(new CustomEvent('expenseEdited'))
                  } catch (error) {
                    console.error('Failed to unmark:', error)
                    toast.error('Failed to unmark recurring expense. Please try again.')
                  }
                }}
                className="h-auto p-0 ml-1 text-purple-700 hover:text-purple-900"
              >
                Stop recurring
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/*
          NOTE: do NOT add `overflow-hidden` here. Inputs sit flush against
          the form's edge and their box-shadow focus ring extends 4px outward
          — overflow-hidden clips that slice, making the ring look uneven.
          The Dialog wrapper above already handles overflow at its own level.
        */}
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4 mt-2 sm:mt-4 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-stone-900 dark:text-stone-100 font-semibold">Amount</Label>
              <Input
                id="amount"
                ref={amountInputRef}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className=""
                required
              />
            </div>
            <div className="space-y-2 max-w-xs sm:max-w-none">
              <Label htmlFor="date" className="text-stone-900 dark:text-stone-100 font-semibold">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className=""
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-stone-900 dark:text-stone-100 font-semibold">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {orderedCategories.map((cat) => (
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

          <div className="space-y-2">
            <Label htmlFor="description" className="text-stone-900 dark:text-stone-100 font-semibold">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="placeholder:text-stone-900 dark:text-stone-100/60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user" className="text-stone-900 dark:text-stone-100 font-semibold">User</Label>
            <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
              <SelectTrigger className="">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
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
            <Checkbox
              id="shared"
              checked={formData.isShared}
              onCheckedChange={(checked) => setFormData({ ...formData, isShared: checked === true })}
            />
            <Label htmlFor="shared" className="cursor-pointer text-stone-900 dark:text-stone-100">
              This is a shared expense (split among all users)
            </Label>
          </div>

          {/*
            Footer pattern: Cancel left, primary actions right. Common dialog
            convention that separates "back out" from "confirm" and keeps the
            three buttons on one row.
          */}
          <div className="flex items-center gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
            >
              Cancel
            </Button>
            <div className="ml-auto flex items-center gap-2">
              {onSaveAndAddAnother && !expense && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveAndAddAnother}
                  disabled={loading || users.length === 0}
                  className="border-amber-500 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-medium"
                >
                  Save & add another
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || users.length === 0}
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
              >
                {users.length === 0 ? 'Loading users...' : loading ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
