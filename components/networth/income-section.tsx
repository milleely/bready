"use client"

/**
 * Income Section Component
 *
 * Displays all income sources for a user with add/edit/delete functionality.
 */

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react"
import type { IncomeSource } from "@/lib/types/networth"
import { getIncomeFrequencyLabel } from "@/lib/networth/categories"
import { normalizeIncomeToMonthly } from "@/lib/networth/calculations"

interface IncomeSectionProps {
  incomeSources: IncomeSource[]
  onAdd: () => void
  onEdit: (incomeSource: IncomeSource) => void
  onDelete: (id: string) => void
}

export function IncomeSection({ incomeSources, onAdd, onEdit, onDelete }: IncomeSectionProps) {
  const totalMonthlyIncome = incomeSources.reduce(
    (sum, income) => sum + normalizeIncomeToMonthly(income.amount, income.frequency),
    0
  )

  return (
    <Card className="border border-stone-200 bg-card shadow-sm dark:border-stone-800">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-100">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-semibold text-stone-900">Income Sources</h2>
              <p className="text-xs md:text-sm text-stone-600 truncate">
                Total: ${totalMonthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}/month
              </p>
            </div>
          </div>
          <Button
            onClick={onAdd}
            size="sm"
            className="flex items-center shrink-0 text-xs md:text-sm bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Income
          </Button>
        </div>

        {/* Income List */}
        {incomeSources.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            <p className="text-sm">No income sources added yet</p>
            <p className="text-xs mt-1">Click "Add Income" to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incomeSources.map((income) => {
              const monthlyAmount = normalizeIncomeToMonthly(income.amount, income.frequency)
              return (
                <div
                  key={income.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-white border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:border-stone-700 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="font-medium text-stone-900 truncate">{income.name}</p>
                    <p className="text-sm text-stone-600 truncate">
                      ${income.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {getIncomeFrequencyLabel(income.frequency)}
                      {" → "}
                      <span className="font-medium text-emerald-600">
                        ${monthlyAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}/month
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                    <button
                      onClick={() => onEdit(income)}
                      className="p-2.5 md:p-2 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                      aria-label={`Edit ${income.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(income.id)}
                      className="p-2.5 md:p-2 rounded-lg hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors"
                      aria-label={`Delete ${income.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
