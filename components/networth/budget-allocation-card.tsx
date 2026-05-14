"use client"

/**
 * Budget Allocation Card Component
 *
 * Displays recommended budget allocation based on selected rule
 * (50/30/20, Conservative, Moderate, or Aggressive).
 */

import { Card, CardContent } from "@/components/ui/card"
import { PieChart } from "lucide-react"
import type { BudgetAllocation } from "@/lib/types/networth"

interface BudgetAllocationCardProps {
  budgetAllocation: BudgetAllocation
}

export function BudgetAllocationCard({
  budgetAllocation,
}: BudgetAllocationCardProps) {
  const allocations = [
    {
      ...budgetAllocation.needs,
      color: "bg-blue-500",
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      ...budgetAllocation.wants,
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    },
    {
      ...budgetAllocation.savings,
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
  ]

  return (
    <Card className="border border-stone-200 bg-card shadow-sm dark:border-stone-800">
      <CardContent className="pt-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/40">
            <PieChart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Your Budget Plan</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">50/30/20 (Balanced)</p>
          </div>
        </div>

        {/* Total Monthly Income */}
        <div className="mb-4 p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-600 dark:text-stone-400">Monthly Income</p>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            ${budgetAllocation.totalMonthlyIncome.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Allocation Breakdown */}
        <div className="space-y-3 mb-4">
          {allocations.map((allocation) => (
            <div
              key={allocation.label}
              className={`p-4 rounded-lg border border-stone-200 dark:border-stone-800 ${allocation.bgColor}`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${allocation.color} shrink-0`} />
                  <span className="font-medium text-stone-900 dark:text-stone-100 truncate">{allocation.label}</span>
                </div>
                <span className={`text-sm font-semibold ${allocation.textColor} shrink-0 whitespace-nowrap`}>
                  {allocation.percentage}%
                </span>
              </div>
              <p className={`text-2xl font-bold ${allocation.textColor}`}>
                ${allocation.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">per month</p>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-auto p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800">
          <p className="text-xs text-stone-600 dark:text-stone-400">
            💡 <strong>Budget Allocation:</strong> Standard rule - balanced approach to needs, wants, and savings
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
