"use client"

/**
 * Expenses Section Component
 *
 * Displays monthly expenses with toggle between auto-calculation (from expense tracker)
 * and manual override.
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Receipt, Pencil, Check, X } from "lucide-react"
import type { MonthlyExpenseOverride } from "@prisma/client"
import { toast } from "sonner"

interface ExpensesSectionProps {
  monthlyExpenses: number // Current calculated expenses
  expenseOverride?: MonthlyExpenseOverride
  onUpdateOverride: (data: { amount: number; useOverride: boolean }) => Promise<void>
}

export function ExpensesSection({
  monthlyExpenses,
  expenseOverride,
  onUpdateOverride,
}: ExpensesSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [overrideAmount, setOverrideAmount] = useState(
    expenseOverride?.amount?.toString() ?? monthlyExpenses.toString()
  )
  const [useOverride, setUseOverride] = useState(expenseOverride?.useOverride ?? false)
  const [isSaving, setIsSaving] = useState(false)

  const displayedExpenses = useOverride && expenseOverride
    ? expenseOverride.amount
    : monthlyExpenses

  const handleSave = async () => {
    const amount = parseFloat(overrideAmount)
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid positive number")
      return
    }

    setIsSaving(true)
    try {
      await onUpdateOverride({ amount, useOverride })
      setIsEditing(false)
      toast.success(useOverride ? "Manual override saved" : "Using auto-calculated expenses")
    } catch (error) {
      toast.error("Failed to update expenses")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setOverrideAmount(expenseOverride?.amount?.toString() ?? monthlyExpenses.toString())
    setUseOverride(expenseOverride?.useOverride ?? false)
  }

  const handleToggleOverride = async (checked: boolean) => {
    setUseOverride(checked)
    if (!isEditing) {
      // Auto-save toggle if not in edit mode
      try {
        await onUpdateOverride({
          amount: parseFloat(overrideAmount),
          useOverride: checked,
        })
        toast.success(checked ? "Using manual override" : "Using auto-calculated expenses")
      } catch (error) {
        toast.error("Failed to update expenses")
        setUseOverride(!checked) // Revert on error
      }
    }
  }

  return (
    <Card className="border border-stone-200 bg-card shadow-sm dark:border-stone-800">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/40">
              <Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Monthly Expenses</h2>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {useOverride ? "Manual override" : "Auto-calculated from tracker"}
              </p>
            </div>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="outline"
              className="border-stone-300"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
        </div>

        {/* Expense Display / Edit Form */}
        {!isEditing ? (
          <div className="text-center py-8">
            <p className="text-4xl font-bold text-stone-900 dark:text-stone-100">
              ${displayedExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">per month</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Manual Override Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
              <div>
                <Label htmlFor="use-override" className="text-sm font-medium">
                  Use Manual Override
                </Label>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Override auto-calculated expenses with a custom amount
                </p>
              </div>
              <Switch
                id="use-override"
                checked={useOverride}
                onCheckedChange={handleToggleOverride}
              />
            </div>

            {/* Amount Input */}
            {useOverride && (
              <div className="space-y-2">
                <Label htmlFor="override-amount">Monthly Expense Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 dark:text-stone-400">
                    $
                  </span>
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
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Auto-calculated: $
                  {monthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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
        )}
      </CardContent>
    </Card>
  )
}
