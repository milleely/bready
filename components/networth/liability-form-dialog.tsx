"use client"

/**
 * Liability Form Dialog Component
 *
 * Modal dialog for adding or editing liabilities (debts).
 */

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingDown } from "lucide-react"
import { toast } from "sonner"
import type { Liability, LiabilityCategory } from "@/lib/types/networth"
import { LIABILITY_CATEGORIES } from "@/lib/networth/categories"

interface LiabilityFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  liability?: Liability | null // If provided, editing mode
  onSave: (data: {
    category: LiabilityCategory
    name: string
    balance: number
    interestRate?: number
    minimumPayment?: number
    notes?: string
  }) => Promise<void>
}

export function LiabilityFormDialog({
  open,
  onOpenChange,
  liability,
  onSave,
}: LiabilityFormDialogProps) {
  const [category, setCategory] = useState<LiabilityCategory>("credit_card")
  const [name, setName] = useState("")
  const [balance, setBalance] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [minimumPayment, setMinimumPayment] = useState("")
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = !!liability

  // Populate form when editing
  useEffect(() => {
    if (liability) {
      setCategory(liability.category as LiabilityCategory)
      setName(liability.name)
      setBalance(liability.balance.toString())
      setInterestRate(liability.interestRate?.toString() ?? "")
      setMinimumPayment(liability.minimumPayment?.toString() ?? "")
      setNotes(liability.notes ?? "")
    } else {
      setCategory("credit_card")
      setName("")
      setBalance("")
      setInterestRate("")
      setMinimumPayment("")
      setNotes("")
    }
  }, [liability])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter a liability name")
      return
    }

    const parsedBalance = parseFloat(balance)
    if (isNaN(parsedBalance) || parsedBalance < 0) {
      toast.error("Please enter a valid non-negative balance")
      return
    }

    const parsedInterestRate = interestRate ? parseFloat(interestRate) : undefined
    if (parsedInterestRate !== undefined && (isNaN(parsedInterestRate) || parsedInterestRate < 0)) {
      toast.error("Please enter a valid non-negative interest rate")
      return
    }

    const parsedMinPayment = minimumPayment ? parseFloat(minimumPayment) : undefined
    if (parsedMinPayment !== undefined && (isNaN(parsedMinPayment) || parsedMinPayment < 0)) {
      toast.error("Please enter a valid non-negative minimum payment")
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        category,
        name: name.trim(),
        balance: parsedBalance,
        interestRate: parsedInterestRate ?? undefined,
        minimumPayment: parsedMinPayment ?? undefined,
        notes: notes.trim() || undefined,
      })
      toast.success(isEditing ? "Liability updated" : "Liability added")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to save liability")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/40">
              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Liability</DialogTitle>
          </div>
          <DialogDescription>
            {isEditing
              ? "Update your liability details"
              : "Add a new liability (debt) to track"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="liability-category">Category</Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as LiabilityCategory)}
            >
              <SelectTrigger id="liability-category" className="">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {LIABILITY_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {LIABILITY_CATEGORIES.find((c) => c.value === category)?.description}
            </p>
          </div>

          {/* Liability Name */}
          <div className="space-y-2">
            <Label htmlFor="liability-name">Liability Name</Label>
            <Input
              id="liability-name"
              placeholder="e.g., Chase Freedom, Navient Student Loan, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Current Balance */}
          <div className="space-y-2">
            <Label htmlFor="liability-balance">Current Balance Owed</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">$</span>
              <Input
                id="liability-balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="pl-6"
              />
            </div>
          </div>

          {/* Interest Rate (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="liability-interest">Interest Rate (Optional)</Label>
            <div className="relative">
              <Input
                id="liability-interest"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">%</span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">APR (Annual Percentage Rate)</p>
          </div>

          {/* Minimum Payment (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="liability-min-payment">Monthly Minimum Payment (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">$</span>
              <Input
                id="liability-min-payment"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={minimumPayment}
                onChange={(e) => setMinimumPayment(e.target.value)}
                className="pl-6"
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="liability-notes">Notes (Optional)</Label>
            <Textarea
              id="liability-notes"
              placeholder="Additional details about this liability..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
