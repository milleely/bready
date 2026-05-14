"use client"

/**
 * Expense Override Dialog Component
 *
 * Reusable dialog for editing monthly expense override settings.
 * Allows users to toggle between auto-calculated and manual expenses.
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
import { Switch } from "@/components/ui/switch"
import { Check, X } from "lucide-react"
import type { MonthlyExpenseOverride } from "@prisma/client"
import { toast } from "sonner"

interface ExpenseOverrideDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  monthlyExpenses: number // Auto-calculated expenses
  expenseOverride?: MonthlyExpenseOverride
  onUpdateOverride: (data: { amount: number; useOverride: boolean }) => Promise<void>
}

export function ExpenseOverrideDialog({
  open,
  onOpenChange,
  monthlyExpenses,
  expenseOverride,
  onUpdateOverride,
}: ExpenseOverrideDialogProps) {
  const [overrideAmount, setOverrideAmount] = useState(
    expenseOverride?.amount?.toString() ?? monthlyExpenses.toString()
  )
  const [useOverride, setUseOverride] = useState(expenseOverride?.useOverride ?? false)
  const [isSaving, setIsSaving] = useState(false)

  // Update state when props change
  useEffect(() => {
    if (open) {
      setOverrideAmount(expenseOverride?.amount?.toString() ?? monthlyExpenses.toString())
      setUseOverride(expenseOverride?.useOverride ?? false)
    }
  }, [open, expenseOverride, monthlyExpenses])

  const handleSave = async () => {
    const amount = parseFloat(overrideAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid positive number")
      return
    }

    setIsSaving(true)
    try {
      await onUpdateOverride({ amount, useOverride })
      toast.success(useOverride ? "Manual override saved" : "Using auto-calculated expenses")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to update expenses")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setOverrideAmount(expenseOverride?.amount?.toString() ?? monthlyExpenses.toString())
    setUseOverride(expenseOverride?.useOverride ?? false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Monthly Expenses</DialogTitle>
          <DialogDescription>
            Choose between auto-calculated expenses from your tracker or set a custom amount.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Manual Override Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div>
              <Label htmlFor="use-override" className="text-sm font-medium">
                Use Manual Override
              </Label>
              <p className="text-xs text-stone-500 mt-1">
                Override auto-calculated expenses with a custom amount
              </p>
            </div>
            <Switch
              id="use-override"
              checked={useOverride}
              onCheckedChange={setUseOverride}
            />
          </div>

          {/* Amount Input */}
          {useOverride && (
            <div className="space-y-2">
              <Label htmlFor="override-amount">Monthly Expense Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
                <Input
                  id="override-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={overrideAmount}
                  onChange={(e) => setOverrideAmount(e.target.value)}
                  className="pl-6"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-stone-500">
                Auto-calculated: ${monthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-stone-300"
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
              disabled={isSaving}
            >
              <Check className="h-4 w-4 mr-1" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
