"use client"

/**
 * Monthly Progress Tracker Component
 *
 * Shows actual spending vs budget allocation for the current month.
 * Displays color-coded progress bars and actionable insights when over budget.
 */

import { Card, CardContent } from "@/components/ui/card"
import { Target, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"
import type { PaycheckAllocation, ActualSpending } from "@/lib/types/networth"
import { EXPENSE_TO_BUDGET_MAPPING } from "@/lib/networth/category-mapping"

interface MonthlyProgressTrackerProps {
  paycheckAllocation: PaycheckAllocation
  actualSpending?: ActualSpending
  month?: string // Format: "YYYY-MM" or "October 2025"
}

export function MonthlyProgressTracker({
  paycheckAllocation,
  actualSpending,
  month = "This Month",
}: MonthlyProgressTrackerProps) {
  // Format month for display (YYYY-MM → "October 2025")
  const formatMonthDisplay = (monthStr?: string): string => {
    if (!monthStr || monthStr === "This Month") return "This Month"

    // Validate format: YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(monthStr)) return "This Month"

    const [year, monthNum] = monthStr.split('-').map(Number)
    const date = new Date(year, monthNum - 1) // monthNum is 1-indexed, Date is 0-indexed
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const displayMonth = formatMonthDisplay(month)

  // Calculate monthly income from bi-weekly amount (grossAmount * 2.167)
  const monthlyIncome = paycheckAllocation.grossAmount * 2.167

  // Get percentages from custom or defaults (50/30/20)
  const percentages = paycheckAllocation.customPercentages ?? {
    needs: 50,
    wants: 30,
    savings: 20,
  }

  // Calculate monthly budgeted amounts (for comparison with actual spending)
  const monthlyBudgets = {
    needs: (monthlyIncome * percentages.needs) / 100,
    wants: (monthlyIncome * percentages.wants) / 100,
    savings: (monthlyIncome * percentages.savings) / 100,
  }

  // Build allocation objects with labels, percentages, and spending data
  const allocations = [
    {
      key: "needs",
      label: "Needs (Housing, Utilities, Food)",
      percentage: percentages.needs,
      monthlyBudget: monthlyBudgets.needs,
      actualSpent: actualSpending?.needsSpent ?? 0,
      color: "bg-blue-500",
      textColor: "text-blue-600",
    },
    {
      key: "wants",
      label: "Wants (Entertainment, Dining Out)",
      percentage: percentages.wants,
      monthlyBudget: monthlyBudgets.wants,
      actualSpent: actualSpending?.wantsSpent ?? 0,
      color: "bg-amber-500",
      textColor: "text-amber-600",
    },
  ]

  // Helper function to calculate spending status
  const getSpendingStatus = (spent: number, budget: number) => {
    const percentage = budget > 0 ? (spent / budget) * 100 : 0
    const remaining = budget - spent

    if (percentage > 100) {
      return {
        status: "over" as const,
        percentage,
        remaining,
        icon: AlertCircle,
        statusColor: "text-red-600",
        progressColor: "bg-red-500",
      }
    } else if (percentage >= 90) {
      return {
        status: "warning" as const,
        percentage,
        remaining,
        icon: AlertTriangle,
        statusColor: "text-amber-600",
        progressColor: "bg-amber-500",
      }
    } else {
      return {
        status: "good" as const,
        percentage,
        remaining,
        icon: CheckCircle2,
        statusColor: "text-emerald-600",
        progressColor: "bg-emerald-500",
      }
    }
  }

  return (
    <Card className="border border-stone-200 bg-card shadow-sm dark:border-stone-800">
      <CardContent className="pt-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/40">
            <Target className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Your Progress</h2>
            <p className="text-sm text-stone-600">{displayMonth} - Actual spending vs budget allocation</p>
          </div>
        </div>

        {/* Allocation Items */}
        <div className="space-y-3">
          {allocations.map((allocation) => {
            const status = getSpendingStatus(allocation.actualSpent, allocation.monthlyBudget)
            const StatusIcon = status.icon

            return (
              <div
                key={allocation.key}
                className="p-4 rounded-lg bg-white border border-stone-200 dark:border-stone-800"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${allocation.color}`} />
                    <div>
                      <p className="font-medium text-stone-900">{allocation.label}</p>
                      <p className="text-xs text-stone-500">{allocation.percentage}%</p>
                    </div>
                  </div>
                  <p className={`text-lg font-semibold ${allocation.textColor}`}>
                    ${allocation.monthlyBudget.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Spending Comparison (always show, even with $0) */}
                <div className="mt-3 pt-3 border-t border-stone-100">
                    {/* Progress Bar - Enhanced height */}
                    <div className="mb-2">
                      <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${status.progressColor} transition-all duration-300`}
                          style={{ width: `${Math.min(status.percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status Text */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`h-4 w-4 ${status.statusColor}`} />
                        <span className="text-stone-600">
                          ${allocation.actualSpent.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          spent ({status.percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <span className={`font-semibold ${status.statusColor}`}>
                        {status.status === "over" ? (
                          <>
                            Over by $
                            {Math.abs(status.remaining).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </>
                        ) : (
                          <>
                            $
                            {status.remaining.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            left
                          </>
                        )}
                      </span>
                    </div>
                  </div>
              </div>
            )
          })}
        </div>

        {/* Category Breakdown */}
        <div className="mt-4 p-4 rounded-lg bg-white border border-stone-200 dark:border-stone-800">
          <h3 className="text-sm font-semibold text-stone-900 mb-3">📊 Category Breakdown</h3>
          <p className="text-xs text-stone-600 mb-3">
            Expense categories are automatically classified into Needs and Wants:
          </p>

          {/* Needs Section */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-blue-600">Needs (Essential)</span>
            </div>
            <div className="pl-5 flex flex-wrap gap-2">
              {EXPENSE_TO_BUDGET_MAPPING.needs.map((category) => (
                <span
                  key={category}
                  className="text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Wants Section */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-600">Wants (Discretionary)</span>
            </div>
            <div className="pl-5 flex flex-wrap gap-2">
              {EXPENSE_TO_BUDGET_MAPPING.wants.map((category) => (
                <span
                  key={category}
                  className="text-xs px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 border border-amber-200"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
