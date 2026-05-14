"use client"

/**
 * Income Form Dialog Component
 *
 * Modal dialog for adding or editing income sources.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign } from "lucide-react"
import { toast } from "sonner"
import type { IncomeSource } from "@prisma/client"
import type { IncomeFrequency } from "@/lib/types/networth"
import { INCOME_FREQUENCIES } from "@/lib/networth/categories"

interface IncomeFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  incomeSource?: IncomeSource | null // If provided, editing mode
  onSave: (data: { name: string; amount: number; frequency: IncomeFrequency }) => Promise<void>
}

export function IncomeFormDialog({
  open,
  onOpenChange,
  incomeSource,
  onSave,
}: IncomeFormDialogProps) {
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [frequency, setFrequency] = useState<IncomeFrequency>("monthly")
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = !!incomeSource

  // Populate form when editing
  useEffect(() => {
    if (incomeSource) {
      setName(incomeSource.name)
      setAmount(incomeSource.amount.toString())
      setFrequency(incomeSource.frequency as IncomeFrequency)
    } else {
      setName("")
      setAmount("")
      setFrequency("monthly")
    }
  }, [incomeSource])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter an income source name")
      return
    }

    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive amount")
      return
    }

    setIsSaving(true)
    try {
      await onSave({ name: name.trim(), amount: parsedAmount, frequency })
      toast.success(isEditing ? "Income source updated" : "Income source added")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to save income source")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-emerald-100">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Income Source</DialogTitle>
          </div>
          <DialogDescription>
            {isEditing
              ? "Update your income source details"
              : "Add a new source of income to track"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Income Source Name */}
          <div className="space-y-2">
            <Label htmlFor="income-name">Income Source Name</Label>
            <Input
              id="income-name"
              placeholder="e.g., Primary Salary, Freelance, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="income-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
              <Input
                id="income-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-6"
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="income-frequency">Frequency</Label>
            <Select value={frequency} onValueChange={(value) => setFrequency(value as IncomeFrequency)}>
              <SelectTrigger id="income-frequency" className="">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {INCOME_FREQUENCIES.map((freq) => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
