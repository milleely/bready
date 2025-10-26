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
import type { IncomeSource } from "@prisma/client"
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
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100">
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Income Sources</h2>
              <p className="text-sm text-stone-600">
                Total: ${totalMonthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}/month
              </p>
            </div>
          </div>
          <Button
            onClick={onAdd}
            size="sm"
            className="bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
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
                  className="flex items-center justify-between p-3 rounded-lg bg-white border border-[hsl(var(--border-light-crust))] hover:border-[hsl(var(--border-golden-crust))] transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-stone-900">{income.name}</p>
                    <p className="text-sm text-stone-600">
                      ${income.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {getIncomeFrequencyLabel(income.frequency)}
                      {" → "}
                      <span className="font-medium text-emerald-600">
                        ${monthlyAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}/month
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(income)}
                      className="p-2 rounded-lg hover:bg-stone-100 text-stone-600 hover:text-stone-900 transition-colors"
                      aria-label={`Edit ${income.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(income.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-stone-600 hover:text-red-600 transition-colors"
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
